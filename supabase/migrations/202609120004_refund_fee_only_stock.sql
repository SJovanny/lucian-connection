-- Do not restock products for a fee-only refund represented by an empty item list.
-- Empty item lists with a positive product amount still support legacy full refunds.

CREATE OR REPLACE FUNCTION public.restock_stock_for_refund(p_refund_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  refund_row public.order_refunds%ROWTYPE;
  requested_items jsonb;
  requested_row record;
  item_row record;
  reservation_row public.stock_reservations%ROWTYPE;
  product_row public.products%ROWTYPE;
  already_for_refund integer;
  already_restored integer;
  remaining_quantity integer;
  restore_quantity integer;
  restored_count integer := 0;
BEGIN
  SELECT * INTO refund_row
  FROM public.order_refunds
  WHERE id = p_refund_id
  FOR UPDATE;

  IF refund_row.id IS NULL THEN RAISE EXCEPTION 'refund not found'; END IF;
  IF refund_row.status <> 'succeeded' THEN RETURN 0; END IF;

  IF jsonb_typeof(COALESCE(refund_row.items, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'refund items must be an array';
  END IF;

  requested_items := COALESCE(refund_row.items, '[]'::jsonb);
  IF jsonb_array_length(requested_items) = 0
     AND refund_row.product_amount > 0 THEN
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object(
        'order_item_id', oi.id,
        'quantity', GREATEST(oi.quantity - COALESCE((
          SELECT SUM(sm.quantity_delta)
          FROM public.stock_movements AS sm
          WHERE sm.order_item_id = oi.id
            AND sm.refund_id IS NOT NULL
            AND sm.movement_type = 'refund'
        ), 0), 0)
      )),
      '[]'::jsonb
    ) INTO requested_items
    FROM public.order_items AS oi
    WHERE oi.order_id = refund_row.order_id
      AND oi.quantity > COALESCE((
        SELECT SUM(sm.quantity_delta)
        FROM public.stock_movements AS sm
        WHERE sm.order_item_id = oi.id
          AND sm.refund_id IS NOT NULL
          AND sm.movement_type = 'refund'
      ), 0);
  END IF;

  FOR requested_row IN
    SELECT x.order_item_id, x.quantity
    FROM jsonb_to_recordset(requested_items)
      AS x(order_item_id uuid, quantity integer)
    ORDER BY x.order_item_id
  LOOP
    IF requested_row.order_item_id IS NULL OR requested_row.quantity IS NULL
       OR requested_row.quantity <= 0 THEN
      RAISE EXCEPTION 'refund item quantity is invalid';
    END IF;

    SELECT oi.id, oi.product_id, oi.quantity
    INTO item_row
    FROM public.order_items AS oi
    WHERE oi.id = requested_row.order_item_id
      AND oi.order_id = refund_row.order_id;
    IF item_row.id IS NULL THEN RAISE EXCEPTION 'refund item does not belong to order'; END IF;

    SELECT * INTO reservation_row
    FROM public.stock_reservations
    WHERE order_item_id = item_row.id;
    IF reservation_row.id IS NULL OR NOT reservation_row.stock_tracked THEN
      CONTINUE;
    END IF;

    SELECT * INTO product_row
    FROM public.products
    WHERE id = reservation_row.product_id
    FOR UPDATE;
    IF product_row.id IS NULL THEN CONTINUE; END IF;

    SELECT COALESCE(SUM(sm.quantity_delta), 0)
    INTO already_restored
    FROM public.stock_movements AS sm
    WHERE sm.order_item_id = item_row.id
      AND sm.refund_id IS NOT NULL
      AND sm.movement_type = 'refund';

    SELECT COALESCE(SUM(sm.quantity_delta), 0)
    INTO already_for_refund
    FROM public.stock_movements AS sm
    WHERE sm.order_item_id = item_row.id
      AND sm.refund_id = p_refund_id
      AND sm.movement_type = 'refund';

    remaining_quantity := item_row.quantity - already_restored;
    IF requested_row.quantity > remaining_quantity + already_for_refund THEN
      RAISE EXCEPTION 'refund quantity exceeds purchased quantity';
    END IF;

    restore_quantity := LEAST(
      requested_row.quantity - already_for_refund,
      remaining_quantity
    );
    IF restore_quantity <= 0 THEN CONTINUE; END IF;

    UPDATE public.products
    SET stock = stock + restore_quantity,
        updated_at = now()
    WHERE id = reservation_row.product_id;

    INSERT INTO public.stock_movements (
      product_id, order_id, order_item_id, reservation_id, refund_id,
      quantity_delta, movement_type, reason
    )
    VALUES (
      reservation_row.product_id, refund_row.order_id, item_row.id,
      reservation_row.id, p_refund_id, restore_quantity, 'refund',
      'Successful refund stock restoration'
    )
    ON CONFLICT (refund_id, order_item_id, movement_type)
      WHERE refund_id IS NOT NULL AND order_item_id IS NOT NULL DO NOTHING;

    restored_count := restored_count + restore_quantity;
  END LOOP;

  RETURN restored_count;
END;
$$;

REVOKE ALL ON FUNCTION public.restock_stock_for_refund(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restock_stock_for_refund(uuid) TO service_role;
