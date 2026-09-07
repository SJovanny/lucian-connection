-- Serialize refund creation per order without invalidating historical pending rows.
CREATE OR REPLACE FUNCTION public.ensure_one_pending_refund_per_order()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status <> 'pending' THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(NEW.order_id::text));

  IF EXISTS (
    SELECT 1
    FROM public.order_refunds AS r
    WHERE r.order_id = NEW.order_id
      AND r.status = 'pending'
      AND r.id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Another refund is already being processed for this order'
      USING ERRCODE = '23505', CONSTRAINT = 'order_refunds_one_pending_per_order';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_refunds_serialize_pending ON public.order_refunds;
CREATE TRIGGER order_refunds_serialize_pending
  BEFORE INSERT OR UPDATE OF order_id, status ON public.order_refunds
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_one_pending_refund_per_order();
