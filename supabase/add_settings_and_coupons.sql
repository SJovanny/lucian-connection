-- ============================================
-- Add Settings and Coupons Tables
-- ============================================

-- Store Settings Table (Singleton)
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  preparation_fee DECIMAL(10,2) DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Ensure only one row exists
CREATE UNIQUE INDEX one_row_only ON store_settings((TRUE));

-- Initialize settings
INSERT INTO store_settings (preparation_fee) VALUES (0) ON CONFLICT DO NOTHING;

-- RLS for settings
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone" 
  ON store_settings FOR SELECT USING (true);

CREATE POLICY "Settings editable by admins" 
  ON store_settings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Coupons Table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2), -- Useful for percentage discounts
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  usage_limit INT, -- Total times can be used
  used_count INT DEFAULT 0,
  is_first_order_only BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- RLS for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons viewable by everyone" 
  ON coupons FOR SELECT 
  USING (true); -- Clients need to check if coupon exists

CREATE POLICY "Coupons editable by admins" 
  ON coupons FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Add coupon_id to orders to track usage
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Trigger to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_id IS NOT NULL AND (OLD.coupon_id IS NULL OR OLD.coupon_id != NEW.coupon_id) THEN
    UPDATE coupons SET used_count = used_count + 1 WHERE id = NEW.coupon_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_coupon_use
  AFTER INSERT OR UPDATE OF coupon_id ON orders
  FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();
