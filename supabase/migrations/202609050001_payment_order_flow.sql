-- A non-paid order must never enter the preparation workflow.
CREATE OR REPLACE FUNCTION public.enforce_paid_order_workflow()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IN ('preparing', 'ready', 'completed')
     AND NEW.payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Order must be paid before entering preparation'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_paid_before_preparation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_enforce_paid_workflow ON public.orders;
CREATE TRIGGER orders_enforce_paid_workflow
  BEFORE INSERT OR UPDATE OF status, payment_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_paid_order_workflow();

-- Keep abandoned checkout rows for auditability, but remove them from the
-- operational workflow. Updating status also invokes existing stock cleanup.
CREATE OR REPLACE FUNCTION public.cancel_abandoned_orders(
  p_max_age interval DEFAULT interval '24 hours'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cancelled_count integer;
BEGIN
  UPDATE public.orders
  SET payment_status = 'cancelled',
      status = 'cancelled',
      updated_at = now()
  WHERE payment_status = 'pending_payment'
    AND status = 'pending'
    AND created_at < now() - p_max_age;

  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  RETURN cancelled_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_abandoned_orders(interval) FROM PUBLIC;
