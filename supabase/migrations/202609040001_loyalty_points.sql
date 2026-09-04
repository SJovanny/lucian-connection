-- Loyalty points, customer-owned coupons, and refund audit trail.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loyalty_points_balance integer NOT NULL DEFAULT 0;

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS loyalty_points_per_euro numeric(10, 4) NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  points_cost integer NOT NULL CHECK (points_cost > 0),
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10, 2) NOT NULL CHECK (discount_value > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_refund_id text UNIQUE,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  product_amount numeric(10, 2) NOT NULL CHECK (product_amount > 0),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  points_reversed integer NOT NULL DEFAULT 0 CHECK (points_reversed >= 0),
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_refunds_order ON public.order_refunds(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_refunds_user ON public.order_refunds(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  order_refund_id uuid REFERENCES public.order_refunds(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('earn', 'redeem', 'adjustment')),
  points integer NOT NULL CHECK (points <> 0),
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_user_created
  ON public.loyalty_ledger(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_ledger_order_earn
  ON public.loyalty_ledger(order_id) WHERE type = 'earn' AND order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_ledger_refund
  ON public.loyalty_ledger(order_refund_id) WHERE order_refund_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.loyalty_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES public.loyalty_rewards(id) ON DELETE RESTRICT,
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
  points_spent integer NOT NULL CHECK (points_spent > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.loyalty_earn_points(
  p_user_id uuid,
  p_order_id uuid,
  p_points integer,
  p_description text
)
RETURNS TABLE(new_balance integer, applied boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_balance integer;
BEGIN
  IF p_points <= 0 THEN RETURN QUERY SELECT loyalty_points_balance, false FROM profiles WHERE id = p_user_id; RETURN; END IF;
  PERFORM 1 FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM loyalty_ledger WHERE order_id = p_order_id AND type = 'earn') THEN
    RETURN QUERY SELECT p.loyalty_points_balance, false FROM profiles p WHERE p.id = p_user_id;
    RETURN;
  END IF;
  UPDATE profiles SET loyalty_points_balance = loyalty_points_balance + p_points WHERE id = p_user_id RETURNING loyalty_points_balance INTO current_balance;
  IF current_balance IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
  INSERT INTO loyalty_ledger(user_id, order_id, type, points, balance_after, description)
  VALUES (p_user_id, p_order_id, 'earn', p_points, current_balance, p_description);
  RETURN QUERY SELECT current_balance, true;
END;
$$;

CREATE OR REPLACE FUNCTION public.loyalty_redeem_points(
  p_user_id uuid,
  p_reward_id uuid,
  p_description text
)
RETURNS TABLE(new_balance integer, points_spent integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_balance integer;
  cost integer;
BEGIN
  SELECT points_cost INTO cost FROM loyalty_rewards WHERE id = p_reward_id AND is_active;
  IF cost IS NULL THEN RAISE EXCEPTION 'reward not found'; END IF;
  SELECT loyalty_points_balance INTO current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF current_balance IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
  IF current_balance < cost THEN RAISE EXCEPTION 'insufficient points'; END IF;
  current_balance := current_balance - cost;
  UPDATE profiles SET loyalty_points_balance = current_balance WHERE id = p_user_id;
  INSERT INTO loyalty_ledger(user_id, type, points, balance_after, description)
  VALUES (p_user_id, 'redeem', -cost, current_balance, p_description);
  RETURN QUERY SELECT current_balance, cost;
END;
$$;

CREATE OR REPLACE FUNCTION public.loyalty_apply_refund(p_refund_id uuid)
RETURNS TABLE(points_reversed integer, new_balance integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  refund_row order_refunds%ROWTYPE;
  order_row orders%ROWTYPE;
  earned integer;
  target_reversed integer;
  already_reversed integer;
  delta integer;
  current_balance integer;
BEGIN
  SELECT * INTO refund_row FROM order_refunds WHERE id = p_refund_id FOR UPDATE;
  IF refund_row.id IS NULL OR refund_row.status <> 'succeeded' THEN RAISE EXCEPTION 'refund is not succeeded'; END IF;
  IF EXISTS (SELECT 1 FROM loyalty_ledger WHERE order_refund_id = p_refund_id) THEN
    RETURN QUERY SELECT 0, p.loyalty_points_balance FROM profiles p WHERE p.id = refund_row.user_id;
    RETURN;
  END IF;
  SELECT * INTO order_row FROM orders WHERE id = refund_row.order_id;
  SELECT COALESCE(points, 0) INTO earned FROM loyalty_ledger WHERE order_id = refund_row.order_id AND type = 'earn';
  IF earned IS NULL OR earned <= 0 OR order_row.subtotal <= 0 THEN
    UPDATE order_refunds SET points_reversed = 0, updated_at = now() WHERE id = p_refund_id;
    RETURN QUERY SELECT 0, p.loyalty_points_balance FROM profiles p WHERE p.id = refund_row.user_id;
    RETURN;
  END IF;
  SELECT COALESCE(SUM(points_reversed), 0) INTO already_reversed FROM order_refunds WHERE order_id = refund_row.order_id AND status = 'succeeded';
  target_reversed := LEAST(earned, FLOOR(earned * LEAST(order_row.subtotal, (SELECT COALESCE(SUM(product_amount), 0) FROM order_refunds WHERE order_id = refund_row.order_id AND status = 'succeeded')) / order_row.subtotal));
  delta := GREATEST(0, target_reversed - already_reversed);
  SELECT loyalty_points_balance INTO current_balance FROM profiles WHERE id = refund_row.user_id FOR UPDATE;
  current_balance := GREATEST(0, current_balance - delta);
  UPDATE profiles SET loyalty_points_balance = current_balance WHERE id = refund_row.user_id;
  IF delta > 0 THEN
    INSERT INTO loyalty_ledger(user_id, order_id, order_refund_id, type, points, balance_after, description)
    VALUES (refund_row.user_id, refund_row.order_id, p_refund_id, 'adjustment', -delta, current_balance, 'Points retirés après remboursement');
  END IF;
  UPDATE order_refunds SET points_reversed = delta, updated_at = now() WHERE id = p_refund_id;
  RETURN QUERY SELECT delta, current_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.loyalty_redeem_reward(
  p_user_id uuid,
  p_reward_id uuid
)
RETURNS TABLE(coupon_id uuid, coupon_code text, new_balance integer, points_spent integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  reward loyalty_rewards%ROWTYPE;
  current_balance integer;
  coupon_row coupons%ROWTYPE;
  generated_code text;
BEGIN
  SELECT * INTO reward FROM loyalty_rewards WHERE id = p_reward_id AND is_active;
  IF reward.id IS NULL THEN RAISE EXCEPTION 'reward not found'; END IF;
  SELECT loyalty_points_balance INTO current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF current_balance IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
  IF current_balance < reward.points_cost THEN RAISE EXCEPTION 'insufficient points'; END IF;

  generated_code := 'FID-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  INSERT INTO coupons(user_id, code, description, discount_type, discount_value, min_order_amount, starts_at, usage_limit, is_active)
  VALUES (p_user_id, generated_code, 'Récompense fidélité : ' || reward.name, reward.discount_type, reward.discount_value, 0, now(), 1, true)
  RETURNING * INTO coupon_row;

  current_balance := current_balance - reward.points_cost;
  UPDATE profiles SET loyalty_points_balance = current_balance WHERE id = p_user_id;
  INSERT INTO loyalty_ledger(user_id, type, points, balance_after, description)
  VALUES (p_user_id, 'redeem', -reward.points_cost, current_balance, 'Échange : ' || reward.name);
  INSERT INTO loyalty_redemptions(user_id, reward_id, coupon_id, points_spent)
  VALUES (p_user_id, reward.id, coupon_row.id, reward.points_cost);
  RETURN QUERY SELECT coupon_row.id, coupon_row.code, current_balance, reward.points_cost;
END;
$$;

ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Anyone can view active loyalty rewards" ON public.loyalty_rewards FOR SELECT USING (is_active OR public.is_admin());
DROP POLICY IF EXISTS "Admins can manage loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Admins can manage loyalty rewards" ON public.loyalty_rewards FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Users can view their loyalty ledger" ON public.loyalty_ledger;
CREATE POLICY "Users can view their loyalty ledger" ON public.loyalty_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can view their loyalty redemptions" ON public.loyalty_redemptions;
CREATE POLICY "Users can view their loyalty redemptions" ON public.loyalty_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can view their refunds" ON public.order_refunds;
CREATE POLICY "Users can view their refunds" ON public.order_refunds FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

REVOKE ALL ON FUNCTION public.loyalty_earn_points(uuid, uuid, integer, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.loyalty_redeem_points(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.loyalty_apply_refund(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.loyalty_redeem_points(uuid, uuid, text) TO authenticated;
REVOKE ALL ON FUNCTION public.loyalty_redeem_reward(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.loyalty_redeem_reward(uuid, uuid) TO authenticated;
