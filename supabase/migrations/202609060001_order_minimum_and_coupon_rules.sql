-- Enforce the store-wide order minimum and make coupon usage atomic.

ALTER TABLE public.store_settings
  ALTER COLUMN min_order_amount SET DEFAULT 10.00;

UPDATE public.store_settings
SET min_order_amount = GREATEST(COALESCE(min_order_amount, 0), 10.00)
WHERE min_order_amount IS NULL OR min_order_amount < 10.00;

ALTER TABLE public.store_settings
  ALTER COLUMN min_order_amount SET NOT NULL;

-- The legacy order trigger counted coupons before payment and could double-count
-- them with use_coupon(). Coupon usage is recorded only after Stripe confirms payment.
DROP TRIGGER IF EXISTS on_order_coupon_use ON public.orders;
DROP FUNCTION IF EXISTS public.increment_coupon_usage();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'store_settings_min_order_amount_floor'
      AND conrelid = 'public.store_settings'::regclass
  ) THEN
    ALTER TABLE public.store_settings
      ADD CONSTRAINT store_settings_min_order_amount_floor CHECK (min_order_amount >= 10.00);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.coupon_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'consumed', 'released')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_reservations_active
  ON public.coupon_reservations(coupon_id, status, expires_at);

ALTER TABLE public.coupon_reservations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.reserve_coupon(
  p_coupon_id uuid,
  p_order_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  coupon_row coupons%ROWTYPE;
  order_row orders%ROWTYPE;
  active_reservations integer;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'invalid coupon reservation user';
  END IF;

  SELECT * INTO order_row
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF order_row.id IS NULL
    OR order_row.user_id IS DISTINCT FROM p_user_id
    OR order_row.coupon_id IS DISTINCT FROM p_coupon_id
    OR order_row.status <> 'pending'
    OR order_row.payment_status <> 'pending_payment' THEN
    RAISE EXCEPTION 'invalid coupon reservation order';
  END IF;

  IF EXISTS (
    SELECT 1 FROM coupon_reservations
    WHERE order_id = p_order_id
  ) THEN
    RETURN false;
  END IF;

  -- Serialize reservations for the same coupon before checking its limit.
  SELECT * INTO coupon_row
  FROM coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF coupon_row.id IS NULL THEN
    RAISE EXCEPTION 'coupon not found';
  END IF;

  IF NOT coupon_row.is_active
    OR (coupon_row.starts_at IS NOT NULL AND coupon_row.starts_at > now())
    OR (coupon_row.expires_at IS NOT NULL AND coupon_row.expires_at < now()) THEN
    RAISE EXCEPTION 'coupon unavailable';
  END IF;

  IF coupon_row.user_id IS NOT NULL AND coupon_row.user_id <> p_user_id THEN
    RAISE EXCEPTION 'coupon unavailable';
  END IF;

  IF coupon_row.is_first_order_only THEN
    PERFORM 1 FROM profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'coupon unavailable';
    END IF;
  END IF;

  IF coupon_row.is_first_order_only AND EXISTS (
    SELECT 1
    FROM coupon_reservations
    WHERE user_id = p_user_id
      AND status = 'reserved'
      AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'coupon unavailable';
  END IF;

  IF coupon_row.is_first_order_only AND EXISTS (
    SELECT 1 FROM orders
    WHERE user_id = p_user_id
      AND payment_status IN ('paid', 'refunded', 'partially_refunded')
  ) THEN
    RAISE EXCEPTION 'coupon unavailable';
  END IF;

  UPDATE coupon_reservations
  SET status = 'released', updated_at = now()
  WHERE coupon_id = p_coupon_id
    AND status = 'reserved'
    AND expires_at <= now();

  SELECT count(*) INTO active_reservations
  FROM coupon_reservations
  WHERE coupon_id = p_coupon_id
    AND status = 'reserved'
    AND expires_at > now();

  IF coupon_row.usage_limit IS NOT NULL
    AND COALESCE(coupon_row.used_count, 0) + active_reservations >= coupon_row.usage_limit THEN
    RAISE EXCEPTION 'coupon usage limit reached';
  END IF;

  INSERT INTO coupon_reservations (coupon_id, order_id, user_id, expires_at)
  VALUES (p_coupon_id, p_order_id, p_user_id, now() + interval '24 hours');

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_coupon_reservation(
  p_order_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role'
    AND auth.uid() IS NOT NULL
    AND (p_user_id IS NULL OR auth.uid() <> p_user_id) THEN
    RAISE EXCEPTION 'invalid coupon release user';
  END IF;

  UPDATE coupon_reservations
  SET status = 'released', updated_at = now()
  FROM orders AS order_row
  WHERE coupon_reservations.order_id = p_order_id
    AND order_row.id = coupon_reservations.order_id
    AND order_row.payment_status <> 'paid'
    AND coupon_reservations.status = 'reserved'
    AND (p_user_id IS NULL OR coupon_reservations.user_id = p_user_id);

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.use_coupon(
  p_coupon_id uuid,
  p_order_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  coupon_row coupons%ROWTYPE;
  reservation_row coupon_reservations%ROWTYPE;
  active_reservations integer;
BEGIN
  IF p_coupon_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM coupon_usages
    WHERE order_id = p_order_id AND coupon_id = p_coupon_id
  ) THEN
    RETURN false;
  END IF;

  -- Serialize consumers of the same coupon before checking its limit.
  SELECT * INTO coupon_row
  FROM coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF coupon_row.id IS NULL THEN
    RAISE EXCEPTION 'coupon not found';
  END IF;

  SELECT * INTO reservation_row
  FROM coupon_reservations
  WHERE order_id = p_order_id AND coupon_id = p_coupon_id
  FOR UPDATE;

  IF reservation_row.id IS NOT NULL AND reservation_row.status = 'consumed' THEN
    RETURN false;
  END IF;

  IF reservation_row.id IS NOT NULL
    AND reservation_row.user_id IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'invalid coupon reservation user';
  END IF;

  IF reservation_row.id IS NOT NULL AND reservation_row.status = 'released' THEN
    RAISE EXCEPTION 'coupon reservation was released';
  END IF;

  IF reservation_row.id IS NOT NULL AND reservation_row.expires_at <= now() THEN
    UPDATE coupon_reservations
    SET status = 'released', updated_at = now()
    WHERE id = reservation_row.id;
    reservation_row.id := NULL;
  END IF;

  IF reservation_row.id IS NULL THEN
    SELECT count(*) INTO active_reservations
    FROM coupon_reservations
    WHERE coupon_id = p_coupon_id
      AND status = 'reserved'
      AND expires_at > now();
  END IF;

  -- A concurrent webhook may have recorded the same order while we waited.
  IF EXISTS (
    SELECT 1 FROM coupon_usages
    WHERE order_id = p_order_id AND coupon_id = p_coupon_id
  ) THEN
    RETURN false;
  END IF;

  IF coupon_row.usage_limit IS NOT NULL
    AND (
      reservation_row.id IS NOT NULL
      AND COALESCE(coupon_row.used_count, 0) >= coupon_row.usage_limit
      OR reservation_row.id IS NULL
      AND COALESCE(coupon_row.used_count, 0) + COALESCE(active_reservations, 0) >= coupon_row.usage_limit
    ) THEN
    RAISE EXCEPTION 'coupon usage limit reached';
  END IF;

  INSERT INTO coupon_usages (coupon_id, order_id, user_id)
  VALUES (p_coupon_id, p_order_id, p_user_id);

  UPDATE coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE id = p_coupon_id;

  IF reservation_row.id IS NOT NULL THEN
    UPDATE coupon_reservations
    SET status = 'consumed', updated_at = now()
    WHERE id = reservation_row.id;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.use_coupon(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.use_coupon(uuid, uuid, uuid) TO service_role;
REVOKE ALL ON FUNCTION public.reserve_coupon(uuid, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_coupon(uuid, uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.release_coupon_reservation(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.release_coupon_reservation(uuid, uuid) TO authenticated, service_role;

-- Expired reservations are released by the existing abandoned-order cron.
CREATE OR REPLACE FUNCTION public.cancel_abandoned_orders(
  p_max_age interval DEFAULT interval '24 hours'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cancelled_count integer;
BEGIN
  UPDATE public.coupon_reservations AS reservation
  SET status = 'released', updated_at = now()
  FROM public.orders AS order_row
  WHERE order_row.id = reservation.order_id
    AND order_row.payment_status <> 'paid'
    AND reservation.status = 'reserved'
    AND reservation.expires_at <= now();

  UPDATE public.orders
  SET payment_status = 'cancelled',
      status = 'cancelled',
      updated_at = now()
  WHERE payment_status = 'pending_payment'
    AND status = 'pending'
    AND created_at < now() - p_max_age;

  GET DIAGNOSTICS cancelled_count = ROW_COUNT;

  UPDATE public.coupon_reservations AS reservation
  SET status = 'released', updated_at = now()
  FROM public.orders AS order_row
  WHERE order_row.id = reservation.order_id
    AND order_row.payment_status = 'cancelled'
    AND reservation.status = 'reserved';

  RETURN cancelled_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_abandoned_orders(interval) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_abandoned_orders(interval) TO service_role;
