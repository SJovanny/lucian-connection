-- Serialize refund reservations, validate their ownership, and synchronize
-- Stripe refund state with order, loyalty, and stock state in one transaction.

ALTER TABLE public.order_refunds
  DROP CONSTRAINT IF EXISTS order_refunds_product_amount_le_amount;

ALTER TABLE public.order_refunds
  ADD CONSTRAINT order_refunds_product_amount_le_amount
  CHECK (product_amount <= amount);

CREATE OR REPLACE FUNCTION public.validate_order_refund()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_user_id uuid;
  item_row record;
  item_quantity integer;
BEGIN
  SELECT user_id INTO order_user_id
  FROM public.orders
  WHERE id = NEW.order_id;

  IF order_user_id IS NULL OR NEW.user_id IS DISTINCT FROM order_user_id THEN
    RAISE EXCEPTION 'refund customer does not match order';
  END IF;

  IF jsonb_typeof(COALESCE(NEW.items, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'refund items must be an array';
  END IF;

  FOR item_row IN
    SELECT x.order_item_id, x.quantity, x.amount
    FROM jsonb_to_recordset(COALESCE(NEW.items, '[]'::jsonb))
      AS x(order_item_id text, quantity integer, amount numeric)
  LOOP
    IF item_row.order_item_id IS NULL
       OR item_row.order_item_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       OR item_row.quantity IS NULL OR item_row.quantity <= 0
       OR item_row.amount IS NULL OR item_row.amount < 0 THEN
      RAISE EXCEPTION 'refund item is invalid';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.order_items
      WHERE id = item_row.order_item_id::uuid
        AND order_id = NEW.order_id
    ) THEN
      RAISE EXCEPTION 'refund item does not belong to order';
    END IF;

    SELECT oi.quantity INTO item_quantity
    FROM public.order_items AS oi
    WHERE oi.id = item_row.order_item_id::uuid;
    IF item_row.quantity > item_quantity THEN
      RAISE EXCEPTION 'refund item quantity exceeds purchased quantity';
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(COALESCE(NEW.items, '[]'::jsonb))
      AS x(order_item_id text, quantity integer, amount numeric)
    GROUP BY x.order_item_id
    HAVING SUM(x.quantity) > (
      SELECT oi.quantity
      FROM public.order_items AS oi
      WHERE oi.id = x.order_item_id::uuid
        AND oi.order_id = NEW.order_id
    )
  ) THEN
    RAISE EXCEPTION 'refund item quantity exceeds purchased quantity';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_refunds_validate ON public.order_refunds;
CREATE TRIGGER order_refunds_validate
  BEFORE INSERT OR UPDATE OF order_id, user_id, amount, product_amount, items
  ON public.order_refunds
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_refund();

CREATE OR REPLACE FUNCTION public.create_refund_reservation(
  p_order_id uuid,
  p_user_id uuid,
  p_request_key text,
  p_full_order boolean,
  p_item_ids uuid[],
  p_created_by uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  request_key text,
  stripe_refund_id text,
  amount numeric,
  product_amount numeric,
  status text,
  items jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.orders%ROWTYPE;
  existing_refund public.order_refunds%ROWTYPE;
  refund_row public.order_refunds%ROWTYPE;
  item_row record;
  active_refund record;
  total_cents bigint;
  subtotal_cents bigint;
  discount_cents bigint;
  product_total_cents bigint;
  gross_total_cents bigint;
  allocation_total_cents bigint;
  item_gross_cents bigint;
  allocated_product_cents bigint := 0;
  item_product_cents bigint;
  refunded_product_cents bigint := 0;
  refunded_amount_cents bigint := 0;
  refunded_quantity integer;
  requested_quantity integer;
  amount_cents bigint := 0;
  product_amount_cents bigint := 0;
  last_item_id uuid;
  refund_items jsonb := '[]'::jsonb;
  has_unitemized_refund boolean := false;
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'admin refund access is required';
  END IF;

  p_full_order := COALESCE(p_full_order, false);

  IF p_order_id IS NULL OR p_user_id IS NULL
     OR p_request_key IS NULL OR char_length(p_request_key) NOT BETWEEN 16 AND 200 THEN
    RAISE EXCEPTION 'invalid refund request';
  END IF;

  SELECT * INTO existing_refund
  FROM public.order_refunds AS r
  WHERE r.request_key = p_request_key
  FOR UPDATE;
  IF existing_refund.id IS NOT NULL THEN
    IF existing_refund.order_id <> p_order_id
       OR existing_refund.user_id <> p_user_id THEN
      RAISE EXCEPTION 'refund request key does not match order';
    END IF;
    RETURN QUERY SELECT existing_refund.id, existing_refund.request_key,
      existing_refund.stripe_refund_id, existing_refund.amount,
      existing_refund.product_amount, existing_refund.status,
      existing_refund.items;
    RETURN;
  END IF;

  SELECT * INTO order_row
  FROM public.orders AS o
  WHERE o.id = p_order_id
  FOR UPDATE;
  IF order_row.id IS NULL OR order_row.user_id IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'order not found';
  END IF;
  IF order_row.payment_status NOT IN ('paid', 'partially_refunded')
     OR order_row.payment_reference IS NULL THEN
    RAISE EXCEPTION 'order is not refundable';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.order_refunds AS r
    WHERE r.order_id = p_order_id AND r.status = 'pending'
  ) THEN
    RAISE EXCEPTION 'another refund is already being processed';
  END IF;

  IF p_full_order IS NOT TRUE
     AND (p_item_ids IS NULL OR COALESCE(array_length(p_item_ids, 1), 0) = 0) THEN
    RAISE EXCEPTION 'select at least one order item';
  END IF;

  IF p_item_ids IS NOT NULL
     AND array_length(p_item_ids, 1) IS NOT NULL
     AND array_length(p_item_ids, 1) <> (
       SELECT count(DISTINCT item_id) FROM unnest(p_item_ids) AS item_id
     ) THEN
    RAISE EXCEPTION 'duplicate refund item';
  END IF;

  IF p_full_order IS NOT TRUE
     AND EXISTS (
       SELECT 1 FROM unnest(p_item_ids) AS selected_item_id
       WHERE NOT EXISTS (
       SELECT 1 FROM public.order_items
         WHERE order_items.id = selected_item_id
           AND order_items.order_id = p_order_id
       )
     ) THEN
    RAISE EXCEPTION 'refund item does not belong to order';
  END IF;

  SELECT
    round(order_row.total_amount * 100)::bigint,
    round(order_row.subtotal * 100)::bigint,
    LEAST(round(order_row.subtotal * 100)::bigint,
      GREATEST(0, round(COALESCE(order_row.discount_amount, 0) * 100)::bigint))
  INTO total_cents, subtotal_cents, discount_cents;
  discount_cents := LEAST(subtotal_cents, GREATEST(0, discount_cents));
  product_total_cents := LEAST(total_cents, GREATEST(0, subtotal_cents - discount_cents));

  SELECT COALESCE(SUM(round(oi.total_price * 100)::bigint), 0)
  INTO gross_total_cents
  FROM public.order_items AS oi
  WHERE oi.order_id = p_order_id;

  SELECT oi.id INTO last_item_id
  FROM public.order_items AS oi
  WHERE oi.order_id = p_order_id
    AND (
      NOT p_full_order
      OR oi.quantity > COALESCE((
        SELECT SUM((element ->> 'quantity')::integer)
        FROM public.order_refunds AS r
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(r.items, '[]'::jsonb)) AS element
        WHERE r.order_id = p_order_id
          AND r.status = 'succeeded'
          AND element ->> 'order_item_id' = oi.id::text
      ), 0)
    )
  ORDER BY oi.id DESC
  LIMIT 1;

  FOR active_refund IN
    SELECT r.amount, r.product_amount, r.items
    FROM public.order_refunds AS r
    WHERE r.order_id = p_order_id AND r.status = 'succeeded'
    FOR UPDATE
  LOOP
    refunded_amount_cents := refunded_amount_cents + round(active_refund.amount * 100)::bigint;
    refunded_product_cents := refunded_product_cents + round(active_refund.product_amount * 100)::bigint;
    IF jsonb_array_length(COALESCE(active_refund.items, '[]'::jsonb)) = 0 THEN
      has_unitemized_refund := true;
    END IF;
  END LOOP;

  IF NOT p_full_order AND has_unitemized_refund THEN
    RAISE EXCEPTION 'remaining refund must cover the full order';
  END IF;

  IF total_cents <= refunded_amount_cents THEN
    RAISE EXCEPTION 'order is already fully refunded';
  END IF;

  allocation_total_cents := CASE
    WHEN p_full_order THEN product_total_cents - refunded_product_cents
    ELSE product_total_cents
  END;

  FOR item_row IN
    SELECT oi.id, oi.product_id, oi.quantity, oi.total_price
    FROM public.order_items AS oi
    WHERE oi.order_id = p_order_id
      AND (
        p_full_order
        OR oi.id = ANY(p_item_ids)
      )
    ORDER BY oi.id
  LOOP
    SELECT COALESCE(SUM((element ->> 'quantity')::integer), 0)
    INTO refunded_quantity
    FROM public.order_refunds AS r
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(r.items, '[]'::jsonb)) AS element
    WHERE r.order_id = p_order_id
      AND r.status = 'succeeded'
      AND element ->> 'order_item_id' = item_row.id::text;

    IF p_full_order THEN
      requested_quantity := item_row.quantity - refunded_quantity;
    ELSE
      IF refunded_quantity > 0 THEN
        RAISE EXCEPTION 'one or more selected items were already refunded';
      END IF;
      requested_quantity := item_row.quantity;
    END IF;

    IF requested_quantity <= 0 THEN CONTINUE; END IF;

    item_gross_cents := floor(
      round(item_row.total_price * 100)::numeric
      * requested_quantity / NULLIF(item_row.quantity, 0)
    )::bigint;

    IF p_full_order AND item_row.id = last_item_id THEN
      item_product_cents := allocation_total_cents - allocated_product_cents;
    ELSIF gross_total_cents > 0 THEN
      item_product_cents := floor(
        item_gross_cents::numeric * allocation_total_cents / gross_total_cents
      )::bigint;
    ELSE
      item_product_cents := 0;
    END IF;
    allocated_product_cents := allocated_product_cents + item_product_cents;

    refund_items := refund_items || jsonb_build_array(jsonb_build_object(
      'order_item_id', item_row.id,
      'product_id', item_row.product_id,
      'quantity', requested_quantity,
      'amount', item_product_cents / 100.0
    ));

    IF NOT p_full_order THEN
      product_amount_cents := product_amount_cents + item_product_cents;
    END IF;
  END LOOP;

  IF p_full_order THEN
    amount_cents := total_cents - refunded_amount_cents;
    product_amount_cents := product_total_cents - refunded_product_cents;
  ELSE
    amount_cents := product_amount_cents;
  END IF;

  IF amount_cents <= 0 OR product_amount_cents < 0
     OR amount_cents > total_cents - refunded_amount_cents
     OR product_amount_cents > product_total_cents - refunded_product_cents THEN
    RAISE EXCEPTION 'refund exceeds order amount';
  END IF;

  INSERT INTO public.order_refunds (
    order_id, user_id, request_key, amount, product_amount, items,
    status, stripe_status, pending_reason, created_by
  )
  VALUES (
    p_order_id, p_user_id, p_request_key, amount_cents / 100.0,
    product_amount_cents / 100.0, refund_items, 'pending', 'pending',
    'Awaiting Stripe refund', p_created_by
  )
  RETURNING * INTO refund_row;

  RETURN QUERY SELECT refund_row.id, refund_row.request_key,
    refund_row.stripe_refund_id, refund_row.amount, refund_row.product_amount,
    refund_row.status, refund_row.items;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_refund_failed(
  p_refund_id uuid,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'admin refund access is required';
  END IF;

  UPDATE public.order_refunds
  SET status = 'failed', stripe_status = 'failed',
      failure_reason = left(COALESCE(p_reason, 'Refund request failed'), 500),
      pending_reason = NULL, updated_at = now()
  WHERE id = p_refund_id
    AND status = 'pending'
    AND stripe_refund_id IS NULL;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_stripe_refund(
  p_local_refund_id uuid,
  p_order_id uuid,
  p_user_id uuid,
  p_stripe_refund_id text,
  p_payment_intent text,
  p_stripe_status text,
  p_failure_reason text,
  p_pending_reason text,
  p_stripe_reference text,
  p_stripe_reference_status text,
  p_stripe_reference_type text,
  p_amount numeric,
  p_product_amount numeric,
  p_items jsonb,
  p_status text
)
RETURNS TABLE(
  refund_id uuid,
  refund_order_id uuid,
  refund_status text,
  stripe_status text,
  refund_amount numeric,
  refund_product_amount numeric,
  refund_items jsonb,
  payment_status text,
  order_status text,
  refunded_at timestamptz,
  points_adjustment integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.orders%ROWTYPE;
  refund_row public.order_refunds%ROWTYPE;
  existing_status text;
  previous_succeeded_cents bigint := 0;
  expected_full_refund_cents bigint;
  crossed_confirmation_boundary boolean := false;
  order_state record;
  loyalty_state record;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'server refund synchronization is required';
  END IF;
  p_items := COALESCE(p_items, '[]'::jsonb);
  IF p_stripe_refund_id IS NULL
     OR p_stripe_refund_id !~ '^re_[A-Za-z0-9]+$'
     OR p_order_id IS NULL OR p_user_id IS NULL
     OR p_payment_intent IS NULL
     OR p_payment_intent !~ '^pi_[A-Za-z0-9]+$'
     OR p_status NOT IN ('pending', 'succeeded', 'failed', 'canceled')
     OR p_amount IS NULL OR p_amount <= 0
     OR p_product_amount IS NULL OR p_product_amount < 0
     OR p_product_amount > p_amount
     OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'invalid Stripe refund state';
  END IF;

  SELECT * INTO order_row
  FROM public.orders AS o
  WHERE o.id = p_order_id
  FOR UPDATE;
  IF order_row.id IS NULL OR order_row.user_id IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'refund order does not match customer';
  END IF;
  IF order_row.payment_reference IS NOT NULL
     AND order_row.payment_reference LIKE 'pi_%'
     AND p_payment_intent IS DISTINCT FROM order_row.payment_reference THEN
    RAISE EXCEPTION 'Stripe refund payment intent does not match order';
  END IF;

  IF p_local_refund_id IS NOT NULL THEN
    SELECT * INTO refund_row
    FROM public.order_refunds
    WHERE id = p_local_refund_id
    FOR UPDATE;
    IF refund_row.id IS NULL THEN
      RAISE EXCEPTION 'local refund does not exist';
    END IF;
  ELSE
    SELECT * INTO refund_row
    FROM public.order_refunds
    WHERE stripe_refund_id = p_stripe_refund_id
    FOR UPDATE;
  END IF;

  IF refund_row.id IS NOT NULL THEN
    IF refund_row.order_id <> p_order_id OR refund_row.user_id <> p_user_id THEN
      RAISE EXCEPTION 'Stripe refund does not match local refund';
    END IF;
    IF refund_row.stripe_refund_id IS NOT NULL
       AND refund_row.stripe_refund_id <> p_stripe_refund_id THEN
      RAISE EXCEPTION 'Stripe refund identifier cannot be changed';
    END IF;
    IF round(refund_row.amount * 100)::bigint <> round(p_amount * 100)::bigint THEN
       RAISE EXCEPTION 'Stripe refund amount does not match reservation';
    END IF;
    IF round(refund_row.product_amount * 100)::bigint <> round(p_product_amount * 100)::bigint THEN
      RAISE EXCEPTION 'Stripe refund product amount does not match reservation';
    END IF;
    IF refund_row.items IS DISTINCT FROM p_items THEN
      RAISE EXCEPTION 'Stripe refund items do not match reservation';
    END IF;
    existing_status := refund_row.status;
    crossed_confirmation_boundary := (existing_status = 'succeeded') <> (p_status = 'succeeded');

    UPDATE public.order_refunds
    SET stripe_refund_id = p_stripe_refund_id,
        stripe_status = left(p_stripe_status, 80),
        failure_reason = left(p_failure_reason, 500),
        pending_reason = left(p_pending_reason, 500),
        last_stripe_sync_at = now(),
        stripe_reference = left(p_stripe_reference, 255),
        stripe_reference_status = left(p_stripe_reference_status, 80),
        stripe_reference_type = left(p_stripe_reference_type, 80),
        amount = p_amount,
        product_amount = p_product_amount,
        items = p_items,
        status = p_status,
        updated_at = now()
    WHERE id = refund_row.id
    RETURNING * INTO refund_row;
  ELSE
    INSERT INTO public.order_refunds (
      order_id, user_id, stripe_refund_id, stripe_status,
      failure_reason, pending_reason, last_stripe_sync_at,
      stripe_reference, stripe_reference_status, stripe_reference_type,
      amount, product_amount, items, status
    )
    VALUES (
      p_order_id, p_user_id, p_stripe_refund_id, left(p_stripe_status, 80),
      left(p_failure_reason, 500), left(p_pending_reason, 500), now(),
      left(p_stripe_reference, 255), left(p_stripe_reference_status, 80),
      left(p_stripe_reference_type, 80), p_amount, p_product_amount,
      p_items, p_status
    )
    RETURNING * INTO refund_row;
    crossed_confirmation_boundary := p_status = 'succeeded';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    SELECT COALESCE(SUM(round(r.amount * 100)::bigint), 0)
    INTO previous_succeeded_cents
    FROM public.order_refunds AS r
    WHERE r.order_id = p_order_id
      AND r.status = 'succeeded'
      AND (refund_row.id IS NULL OR r.id <> refund_row.id);
    expected_full_refund_cents := round(order_row.total_amount * 100)::bigint
      - previous_succeeded_cents;
    IF p_status = 'succeeded'
       AND round(p_amount * 100)::bigint <> expected_full_refund_cents THEN
      RAISE EXCEPTION 'itemless Stripe refund must cover the remaining order';
    END IF;
  END IF;

  IF existing_status IS NULL OR existing_status IS DISTINCT FROM p_status THEN
    PERFORM public.record_system_audit_event(
      'order.refund_state_synchronized', 'order', p_order_id,
      'Stripe refund state synchronized',
      jsonb_build_object(
        'refund_id', refund_row.id,
        'stripe_refund_id', p_stripe_refund_id,
        'status', p_status
      )
    );
  END IF;

  SELECT * INTO order_state
  FROM public.recompute_order_refund_state(p_order_id);

  IF crossed_confirmation_boundary THEN
    SELECT * INTO loyalty_state
    FROM public.reconcile_order_refund_loyalty(p_order_id, refund_row.id);
  ELSE
    SELECT * INTO loyalty_state
    FROM public.reconcile_order_refund_loyalty(p_order_id, NULL);
  END IF;

  RETURN QUERY SELECT
    refund_row.id, refund_row.order_id, refund_row.status,
    refund_row.stripe_status, refund_row.amount, refund_row.product_amount,
    refund_row.items, order_state.payment_status::text,
    order_state.order_status::text, order_state.refunded_at,
    COALESCE(loyalty_state.points_adjustment, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.create_refund_reservation(uuid, uuid, text, boolean, uuid[], uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_refund_failed(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sync_stripe_refund(uuid, uuid, uuid, text, text, text, text, text, text, text, text, numeric, numeric, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_refund_reservation(uuid, uuid, text, boolean, uuid[], uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_refund_failed(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_stripe_refund(uuid, uuid, uuid, text, text, text, text, text, text, text, text, numeric, numeric, jsonb, text) TO service_role;
