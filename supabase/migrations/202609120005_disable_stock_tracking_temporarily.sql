-- Keep stock values available for reporting without blocking products at zero.
-- Administrators can re-enable tracking per product when inventory is reliable.
UPDATE public.products
SET track_stock = false,
    updated_at = now()
WHERE track_stock IS DISTINCT FROM false;
