-- Keep the Stripe state separately from the local financial state so failed
-- refunds can be distinguished from refunds that are still being processed.

ALTER TABLE public.order_refunds
  ADD COLUMN IF NOT EXISTS stripe_status text,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS pending_reason text,
  ADD COLUMN IF NOT EXISTS last_stripe_sync_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_reference text,
  ADD COLUMN IF NOT EXISTS stripe_reference_status text,
  ADD COLUMN IF NOT EXISTS stripe_reference_type text,
  ADD COLUMN IF NOT EXISTS points_restored integer NOT NULL DEFAULT 0;

ALTER TABLE public.order_refunds
  DROP CONSTRAINT IF EXISTS order_refunds_points_restored_nonnegative;

ALTER TABLE public.order_refunds
  ADD CONSTRAINT order_refunds_points_restored_nonnegative CHECK (points_restored >= 0);

UPDATE public.order_refunds
SET stripe_status = status
WHERE stripe_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_order_refunds_status_created
  ON public.order_refunds (status, created_at DESC)
  WHERE stripe_refund_id IS NOT NULL;

-- Retain the operational state so a refund that later fails does not leave an
-- otherwise valid order permanently marked as refunded.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_status_before_refund text,
  ADD COLUMN IF NOT EXISTS refund_points_adjusted integer NOT NULL DEFAULT 0;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_refund_points_adjusted_nonnegative;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_refund_points_adjusted_nonnegative CHECK (refund_points_adjusted >= 0);

-- Bring orders already processed by the prior refund flow into the new
-- aggregate used to reconcile a refund that is later reversed by Stripe.
UPDATE public.orders AS o
SET refund_points_adjusted = COALESCE((
  SELECT SUM(r.points_reversed)
  FROM public.order_refunds AS r
  WHERE r.order_id = o.id
    AND r.status = 'succeeded'
), 0)
WHERE o.refund_points_adjusted = 0;

CREATE OR REPLACE FUNCTION public.recompute_order_refund_state(p_order_id uuid)
RETURNS TABLE(payment_status text, order_status text, refunded_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.orders%ROWTYPE;
  refunded_cents bigint;
  total_cents bigint;
  next_payment_status public.orders.payment_status%TYPE;
  next_order_status public.orders.status%TYPE;
  next_refunded_at timestamptz;
  preserved_order_status text;
BEGIN
  SELECT * INTO order_row
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF order_row.id IS NULL THEN
    RAISE EXCEPTION 'order not found';
  END IF;

  SELECT COALESCE(SUM(ROUND(r.amount * 100)::bigint), 0) INTO refunded_cents
  FROM public.order_refunds AS r
  WHERE r.order_id = p_order_id
    AND r.status = 'succeeded';

  total_cents := GREATEST(0, ROUND(order_row.total_amount * 100)::bigint);
  IF refunded_cents > total_cents THEN
    RAISE EXCEPTION 'succeeded refunds exceed order total';
  END IF;

  IF refunded_cents = 0 THEN
    next_payment_status := CASE
      WHEN order_row.payment_status IN ('refunded', 'partially_refunded') THEN 'paid'
      ELSE order_row.payment_status
    END;
  ELSIF refunded_cents = total_cents AND total_cents > 0 THEN
    next_payment_status := 'refunded';
  ELSE
    next_payment_status := 'partially_refunded';
  END IF;

  preserved_order_status := order_row.fulfillment_status_before_refund;
  next_order_status := order_row.status;
  IF next_payment_status = 'refunded' THEN
    IF order_row.status <> 'refunded' THEN
      preserved_order_status := order_row.status;
    END IF;
    next_order_status := 'refunded';
  ELSIF order_row.status = 'refunded' THEN
    -- Legacy full refunds did not save the preceding state. Pending is the
    -- safest operational fallback if such a refund later fails.
    next_order_status := COALESCE(order_row.fulfillment_status_before_refund, 'pending');
  END IF;

  next_refunded_at := CASE
    WHEN refunded_cents > 0 THEN COALESCE(order_row.refunded_at, now())
    ELSE NULL
  END;

  UPDATE public.orders AS o
  SET payment_status = next_payment_status,
      status = next_order_status,
      fulfillment_status_before_refund = preserved_order_status,
      refunded_at = next_refunded_at,
      updated_at = now()
  WHERE o.id = p_order_id;

  RETURN QUERY
  SELECT o.payment_status::text, o.status::text, o.refunded_at
  FROM public.orders AS o
  WHERE o.id = p_order_id;
END;
$$;

-- Reconcile the loyalty balance against every currently succeeded refund.
-- This handles a late Stripe failure even when another partial refund remains.
CREATE OR REPLACE FUNCTION public.reconcile_order_refund_loyalty(
  p_order_id uuid,
  p_refund_id uuid DEFAULT NULL
)
RETURNS TABLE(points_adjustment integer, new_balance integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.orders%ROWTYPE;
  earned integer;
  refunded_products numeric;
  target_reversed integer := 0;
  adjustment integer;
  applied_adjustment integer;
  current_balance integer;
  can_link_refund boolean := false;
BEGIN
  SELECT * INTO order_row
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF order_row.id IS NULL THEN
    RAISE EXCEPTION 'order not found';
  END IF;

  IF order_row.user_id IS NULL THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  SELECT COALESCE(l.points, 0) INTO earned
  FROM public.loyalty_ledger AS l
  WHERE l.order_id = p_order_id
    AND l.type = 'earn';

  SELECT COALESCE(SUM(r.product_amount), 0) INTO refunded_products
  FROM public.order_refunds AS r
  WHERE r.order_id = p_order_id
    AND r.status = 'succeeded';

  IF earned IS NOT NULL AND earned > 0 AND order_row.subtotal > 0 THEN
    target_reversed := LEAST(
      earned,
      FLOOR(earned * LEAST(order_row.subtotal, refunded_products) / order_row.subtotal)
    );
  END IF;

  SELECT p.loyalty_points_balance INTO current_balance
  FROM public.profiles AS p
  WHERE p.id = order_row.user_id
  FOR UPDATE;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  adjustment := target_reversed - order_row.refund_points_adjusted;
  IF adjustment = 0 THEN
    RETURN QUERY SELECT 0, current_balance;
    RETURN;
  END IF;

  IF adjustment > 0 THEN
    -- Points already redeemed cannot push the balance below zero.
    applied_adjustment := LEAST(adjustment, current_balance);

    IF p_refund_id IS NOT NULL AND applied_adjustment > 0 THEN
      SELECT NOT EXISTS (
        SELECT 1
        FROM public.loyalty_ledger AS l
        WHERE l.order_refund_id = p_refund_id
      ) INTO can_link_refund;
    END IF;

    IF applied_adjustment > 0 THEN
      current_balance := current_balance - applied_adjustment;
      UPDATE public.profiles AS p
      SET loyalty_points_balance = current_balance
      WHERE p.id = order_row.user_id;

      IF p_refund_id IS NOT NULL THEN
        UPDATE public.order_refunds AS r
        SET points_reversed = r.points_reversed + applied_adjustment,
            updated_at = now()
        WHERE r.id = p_refund_id;
      END IF;

      INSERT INTO public.loyalty_ledger(
        user_id,
        order_id,
        order_refund_id,
        type,
        points,
        balance_after,
        description
      )
      VALUES (
        order_row.user_id,
        p_order_id,
        CASE WHEN can_link_refund THEN p_refund_id ELSE NULL END,
        'adjustment',
        -applied_adjustment,
        current_balance,
        'Points retirés après remboursement'
      );
    END IF;

    UPDATE public.orders AS o
    SET refund_points_adjusted = o.refund_points_adjusted + applied_adjustment,
        updated_at = now()
    WHERE o.id = p_order_id;

    RETURN QUERY SELECT -applied_adjustment, current_balance;
    RETURN;
  END IF;

  applied_adjustment := -adjustment;
  current_balance := current_balance + applied_adjustment;
  UPDATE public.profiles AS p
  SET loyalty_points_balance = current_balance
  WHERE p.id = order_row.user_id;

  UPDATE public.orders AS o
  SET refund_points_adjusted = o.refund_points_adjusted - applied_adjustment,
      updated_at = now()
  WHERE o.id = p_order_id;

  IF p_refund_id IS NOT NULL THEN
    UPDATE public.order_refunds AS r
    SET points_restored = r.points_restored + applied_adjustment,
          updated_at = now()
    WHERE r.id = p_refund_id;
  END IF;

  INSERT INTO public.loyalty_ledger(
    user_id,
    order_id,
    type,
    points,
    balance_after,
    description
  )
  VALUES (
    order_row.user_id,
    p_order_id,
    'adjustment',
    applied_adjustment,
    current_balance,
    'Points rétablis après mise à jour du remboursement'
  );

  RETURN QUERY SELECT applied_adjustment, current_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.recompute_order_refund_state(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reconcile_order_refund_loyalty(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_order_refund_state(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reconcile_order_refund_loyalty(uuid, uuid) TO service_role;
