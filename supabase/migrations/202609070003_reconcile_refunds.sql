-- Retry loyalty adjustments for succeeded refunds whose webhook previously failed.
DO $$
DECLARE
  refund_id uuid;
BEGIN
  FOR refund_id IN
    SELECT r.id
    FROM public.order_refunds AS r
    WHERE r.status = 'succeeded'
      AND NOT EXISTS (
        SELECT 1
        FROM public.loyalty_ledger AS l
        WHERE l.order_refund_id = r.id
      )
  LOOP
    PERFORM public.loyalty_apply_refund(refund_id);
  END LOOP;
END;
$$;
