-- ==================================================
-- Discounts & Coupons setup (run once in Supabase SQL)
-- ==================================================

-- ---------------------------
-- Coupons Table
-- ---------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  usage_limit INT,
  used_count INT DEFAULT 0,
  is_first_order_only BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coupons viewable by everyone" ON coupons;
CREATE POLICY "Coupons viewable by everyone"
  ON coupons FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Coupons editable by admins" ON coupons;
CREATE POLICY "Coupons editable by admins"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Track coupon usage on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_id IS NOT NULL AND (OLD.coupon_id IS NULL OR OLD.coupon_id != NEW.coupon_id) THEN
    UPDATE coupons SET used_count = used_count + 1 WHERE id = NEW.coupon_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_coupon_use ON orders;
CREATE TRIGGER on_order_coupon_use
  AFTER INSERT OR UPDATE OF coupon_id ON orders
  FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- Active coupons view (ensures time window is enforced by DB clock)
CREATE OR REPLACE VIEW public.coupons_active AS
SELECT *
FROM public.coupons
WHERE is_active = true
  AND (starts_at IS NULL OR starts_at <= NOW())
  AND (expires_at IS NULL OR expires_at >= NOW());

GRANT SELECT ON public.coupons_active TO anon, authenticated;

-- ---------------------------
-- Reductions Table
-- ---------------------------
CREATE TABLE IF NOT EXISTS reductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),

  applies_to TEXT NOT NULL CHECK (applies_to IN ('all', 'categories', 'products')),
  category_ids UUID[] DEFAULT '{}',
  product_ids UUID[] DEFAULT '{}',

  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (starts_at IS NULL OR expires_at IS NULL OR starts_at <= expires_at),
  CONSTRAINT valid_scope CHECK (
    (applies_to = 'all' AND category_ids = '{}' AND product_ids = '{}') OR
    (applies_to = 'categories' AND array_length(category_ids, 1) > 0) OR
    (applies_to = 'products' AND array_length(product_ids, 1) > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_reductions_active ON reductions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reductions_dates ON reductions(starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_reductions_priority ON reductions(priority DESC);
CREATE INDEX IF NOT EXISTS idx_reductions_category_ids ON reductions USING GIN(category_ids);
CREATE INDEX IF NOT EXISTS idx_reductions_product_ids ON reductions USING GIN(product_ids);

ALTER TABLE reductions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reductions are viewable by everyone" ON reductions;
CREATE POLICY "Reductions are viewable by everyone"
  ON reductions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert reductions" ON reductions;
CREATE POLICY "Admins can insert reductions"
  ON reductions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update reductions" ON reductions;
CREATE POLICY "Admins can update reductions"
  ON reductions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete reductions" ON reductions;
CREATE POLICY "Admins can delete reductions"
  ON reductions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to get active reductions for a product
CREATE OR REPLACE FUNCTION public.get_active_reductions_for_product(p_product_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.discount_type,
    r.discount_value,
    r.priority
  FROM reductions r
  LEFT JOIN products p ON p.id = p_product_id
  WHERE r.is_active = true
    AND (r.starts_at IS NULL OR r.starts_at <= NOW())
    AND (r.expires_at IS NULL OR r.expires_at >= NOW())
    AND (
      r.applies_to = 'all' OR
      (r.applies_to = 'products' AND p_product_id = ANY(r.product_ids)) OR
      (r.applies_to = 'categories' AND p.category_id = ANY(r.category_ids))
    )
  ORDER BY r.priority DESC, r.discount_value DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate discounted price
CREATE OR REPLACE FUNCTION public.calculate_discounted_price(p_product_id UUID, p_original_price NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  v_reduction RECORD;
  v_discount NUMERIC := 0;
BEGIN
  SELECT * INTO v_reduction
  FROM public.get_active_reductions_for_product(p_product_id)
  LIMIT 1;

  IF v_reduction IS NOT NULL THEN
    IF v_reduction.discount_type = 'percentage' THEN
      v_discount := p_original_price * (v_reduction.discount_value / 100);
    ELSE
      v_discount := v_reduction.discount_value;
    END IF;

    RETURN GREATEST(0, p_original_price - v_discount);
  END IF;

  RETURN p_original_price;
END;
$$ LANGUAGE plpgsql;

-- Computed column for PostgREST (select discounted_price)
CREATE OR REPLACE FUNCTION public.discounted_price(p products)
RETURNS NUMERIC AS $$
BEGIN
  RETURN public.calculate_discounted_price(p.id, p.price);
END;
$$ LANGUAGE plpgsql STABLE;

-- View for products with discounted price (fallback when computed columns are not exposed)
CREATE OR REPLACE VIEW public.products_with_discount AS
SELECT
  p.*,
  public.calculate_discounted_price(p.id, p.price) AS discounted_price
FROM public.products p;

GRANT SELECT ON public.products_with_discount TO anon, authenticated;
