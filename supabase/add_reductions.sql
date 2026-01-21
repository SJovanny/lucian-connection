-- Create reductions table
CREATE TABLE IF NOT EXISTS reductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  
  -- Application scope
  applies_to TEXT NOT NULL CHECK (applies_to IN ('all', 'categories', 'products')),
  category_ids UUID[] DEFAULT '{}',
  product_ids UUID[] DEFAULT '{}',
  
  -- Validity period
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (starts_at IS NULL OR expires_at IS NULL OR starts_at <= expires_at),
  CONSTRAINT valid_scope CHECK (
    (applies_to = 'all' AND category_ids = '{}' AND product_ids = '{}') OR
    (applies_to = 'categories' AND array_length(category_ids, 1) > 0) OR
    (applies_to = 'products' AND array_length(product_ids, 1) > 0)
  )
);

-- Create indexes
CREATE INDEX idx_reductions_active ON reductions(is_active) WHERE is_active = true;
CREATE INDEX idx_reductions_dates ON reductions(starts_at, expires_at);
CREATE INDEX idx_reductions_priority ON reductions(priority DESC);
CREATE INDEX idx_reductions_category_ids ON reductions USING GIN(category_ids);
CREATE INDEX idx_reductions_product_ids ON reductions USING GIN(product_ids);

-- Enable RLS
ALTER TABLE reductions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Reductions are viewable by everyone"
  ON reductions FOR SELECT
  USING (true);

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
CREATE OR REPLACE FUNCTION get_active_reductions_for_product(p_product_id UUID)
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
CREATE OR REPLACE FUNCTION calculate_discounted_price(p_product_id UUID, p_original_price NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  v_reduction RECORD;
  v_discount NUMERIC := 0;
BEGIN
  SELECT * INTO v_reduction
  FROM get_active_reductions_for_product(p_product_id)
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
