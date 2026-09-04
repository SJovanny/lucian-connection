-- Add a final "completed" status for orders that have been picked up.
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'completed';
