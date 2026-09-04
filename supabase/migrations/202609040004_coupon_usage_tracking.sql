-- Fix: coupons were never marked as used, so usage_limit was never enforced
-- (used_count stayed at 0 forever, allowing unlimited reuse of a coupon).

CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One coupon usage per order: prevents the webhook from double-incrementing
-- used_count if Stripe retries the same checkout.session.completed event.
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_usages_order ON public.coupon_usages(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon ON public.coupon_usages(coupon_id);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own coupon usages" ON public.coupon_usages;
CREATE POLICY "Users can view their own coupon usages" ON public.coupon_usages
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Atomically records that a coupon was used for an order and bumps used_count.
-- Safe to call multiple times for the same order (webhook retries): only the
-- first call has an effect, thanks to the unique index on order_id.
CREATE OR REPLACE FUNCTION public.use_coupon(
  p_coupon_id uuid,
  p_order_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_coupon_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO coupon_usages (coupon_id, order_id, user_id)
  VALUES (p_coupon_id, p_order_id, p_user_id)
  ON CONFLICT (order_id) DO NOTHING;

  IF NOT FOUND THEN
    -- Already recorded for this order (webhook retry) -> no-op.
    RETURN false;
  END IF;

  UPDATE coupons SET used_count = used_count + 1 WHERE id = p_coupon_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.use_coupon(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Backfill: recompute used_count for existing coupons from paid orders that
-- already reference them, and record the corresponding usages, so historical
-- data is consistent going forward.
INSERT INTO coupon_usages (coupon_id, order_id, user_id)
SELECT o.coupon_id, o.id, o.user_id
FROM orders o
WHERE o.coupon_id IS NOT NULL
  AND o.payment_status IN ('paid', 'refunded', 'partially_refunded')
ON CONFLICT (order_id) DO NOTHING;

UPDATE coupons c
SET used_count = (SELECT count(*) FROM coupon_usages cu WHERE cu.coupon_id = c.id);
