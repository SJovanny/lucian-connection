-- Refunds can contain only preparation fees after the products were refunded.
ALTER TABLE public.order_refunds
  DROP CONSTRAINT IF EXISTS order_refunds_product_amount_check;

ALTER TABLE public.order_refunds
  DROP CONSTRAINT IF EXISTS order_refunds_product_amount_nonnegative;

ALTER TABLE public.order_refunds
  ADD CONSTRAINT order_refunds_product_amount_nonnegative CHECK (product_amount >= 0);

-- Qualify points_reversed so it cannot resolve to the function return column.
CREATE OR REPLACE FUNCTION public.loyalty_apply_refund(p_refund_id uuid)
RETURNS TABLE(points_reversed integer, new_balance integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  refund_row order_refunds%ROWTYPE;
  order_row orders%ROWTYPE;
  earned integer;
  target_reversed integer;
  already_reversed integer;
  delta integer;
  current_balance integer;
BEGIN
  SELECT * INTO refund_row
  FROM public.order_refunds
  WHERE id = p_refund_id
  FOR UPDATE;

  IF refund_row.id IS NULL OR refund_row.status <> 'succeeded' THEN
    RAISE EXCEPTION 'refund is not succeeded';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.loyalty_ledger
    WHERE order_refund_id = p_refund_id
  ) THEN
    RETURN QUERY
    SELECT 0, p.loyalty_points_balance
    FROM public.profiles AS p
    WHERE p.id = refund_row.user_id;
    RETURN;
  END IF;

  SELECT * INTO order_row
  FROM public.orders
  WHERE id = refund_row.order_id;

  SELECT COALESCE(l.points, 0) INTO earned
  FROM public.loyalty_ledger AS l
  WHERE l.order_id = refund_row.order_id
    AND l.type = 'earn';

  IF earned IS NULL OR earned <= 0 OR order_row.subtotal <= 0 THEN
    UPDATE public.order_refunds AS r
    SET points_reversed = 0,
        updated_at = now()
    WHERE r.id = p_refund_id;
    RETURN QUERY
    SELECT 0, p.loyalty_points_balance
    FROM public.profiles AS p
    WHERE p.id = refund_row.user_id;
    RETURN;
  END IF;

  SELECT COALESCE(SUM(r.points_reversed), 0) INTO already_reversed
  FROM public.order_refunds AS r
  WHERE r.order_id = refund_row.order_id
    AND r.status = 'succeeded';

  target_reversed := LEAST(
    earned,
    FLOOR(
      earned * LEAST(
        order_row.subtotal,
        (
          SELECT COALESCE(SUM(r.product_amount), 0)
          FROM public.order_refunds AS r
          WHERE r.order_id = refund_row.order_id
            AND r.status = 'succeeded'
        )
      ) / order_row.subtotal
    )
  );
  delta := GREATEST(0, target_reversed - already_reversed);

  SELECT p.loyalty_points_balance INTO current_balance
  FROM public.profiles AS p
  WHERE p.id = refund_row.user_id
  FOR UPDATE;

  current_balance := GREATEST(0, current_balance - delta);
  UPDATE public.profiles AS p
  SET loyalty_points_balance = current_balance
  WHERE p.id = refund_row.user_id;

  IF delta > 0 THEN
    INSERT INTO public.loyalty_ledger(
      user_id,
      order_id,
      order_refund_id,
      type,
      points,
      balance_after,
      description
    )
    VALUES (
      refund_row.user_id,
      refund_row.order_id,
      p_refund_id,
      'adjustment',
      -delta,
      current_balance,
      'Points retirés après remboursement'
    );
  END IF;

  UPDATE public.order_refunds AS r
  SET points_reversed = delta,
      updated_at = now()
  WHERE r.id = p_refund_id;

  RETURN QUERY SELECT delta, current_balance;
END;
$$;
