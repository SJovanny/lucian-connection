-- Consolidate legacy order statuses before restricting the database constraint.
UPDATE public.orders SET status = 'pending' WHERE status = 'confirmed';
UPDATE public.orders SET status = 'ready' WHERE status = 'delivered';

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'));
