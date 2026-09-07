-- A partial refund does not undo the successful payment for the remaining items.
CREATE OR REPLACE FUNCTION public.enforce_paid_order_workflow()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IN ('preparing', 'ready', 'completed')
     AND NEW.payment_status NOT IN ('paid', 'partially_refunded') THEN
    RAISE EXCEPTION 'Order must be paid before entering preparation'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_paid_before_preparation';
  END IF;

  RETURN NEW;
END;
$$;
