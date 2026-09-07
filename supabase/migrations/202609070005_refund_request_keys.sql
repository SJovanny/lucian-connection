-- Store the idempotency key before calling Stripe so retries share one refund.
ALTER TABLE public.order_refunds
  ADD COLUMN IF NOT EXISTS request_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_order_refunds_request_key
  ON public.order_refunds (request_key)
  WHERE request_key IS NOT NULL;
