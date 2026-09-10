-- The storefront uses the reductions system for sale prices.
-- Remove the unused legacy comparison price from products and its public view.
DROP VIEW IF EXISTS public.products_with_discount;

ALTER TABLE public.products
  DROP COLUMN IF EXISTS compare_at_price;

CREATE VIEW public.products_with_discount AS
SELECT id,
  slug,
  price,
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

GRANT SELECT ON public.products_with_discount TO anon, authenticated;
