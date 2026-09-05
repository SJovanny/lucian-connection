ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_alcoholic boolean NOT NULL DEFAULT false;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS contains_alcohol boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS age_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS pickup_age_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS pickup_age_verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Existing products in the dedicated alcoholic-beverages category must also be protected.
UPDATE public.products AS p
SET is_alcoholic = true
FROM public.categories AS c
WHERE p.category_id = c.id
  AND c.slug = 'boissons-alcoolisees';

-- Keep the public discounted-products view in sync with the new product flag.
CREATE OR REPLACE VIEW public.products_with_discount AS
SELECT id,
  slug,
  price,
  compare_at_price,
  category_id,
  image_url,
  translations,
  allergens,
  stock,
  low_stock_threshold,
  track_stock,
  unit,
  is_featured,
  is_active,
  created_at,
  updated_at,
  calculate_discounted_price(id, price) AS discounted_price,
  is_alcoholic
FROM public.products p;

CREATE INDEX IF NOT EXISTS idx_products_alcoholic
  ON public.products (is_alcoholic)
  WHERE is_alcoholic = true;

CREATE OR REPLACE FUNCTION public.enforce_alcohol_age_verification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.contains_alcohol AND NEW.age_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Age confirmation is required for orders containing alcohol'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_alcohol_age_confirmed';
  END IF;

  IF NEW.status = 'completed'
     AND NEW.contains_alcohol
     AND NEW.pickup_age_verified_at IS NULL THEN
    RAISE EXCEPTION 'Pickup age verification is required for orders containing alcohol'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_alcohol_pickup_age_verified';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_enforce_alcohol_age_verification ON public.orders;
CREATE TRIGGER orders_enforce_alcohol_age_verification
  BEFORE INSERT OR UPDATE
  ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_alcohol_age_verification();
