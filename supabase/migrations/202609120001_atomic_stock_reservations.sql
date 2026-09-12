-- Reserve tracked inventory when an order is prepared, then release it on
-- cancellation or restore it once for each successful itemized refund.

CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  stock_tracked boolean NOT NULL,
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'consumed', 'released')),
  expires_at timestamptz NOT NULL,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stock_reservations_order_item_key UNIQUE (order_item_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_order_status
  ON public.stock_reservations(order_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expiry
  ON public.stock_reservations(status, expires_at)
  WHERE status = 'reserved';

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE SET NULL,
  reservation_id uuid REFERENCES public.stock_reservations(id) ON DELETE SET NULL,
  refund_id uuid REFERENCES public.order_refunds(id) ON DELETE SET NULL,
  quantity_delta integer NOT NULL CHECK (quantity_delta <> 0),
  movement_type text NOT NULL
    CHECK (movement_type IN ('reserve', 'release', 'refund', 'adjustment')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created
  ON public.stock_movements(product_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_movements_reservation_type
  ON public.stock_movements(reservation_id, movement_type)
  WHERE reservation_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_movements_refund_item
  ON public.stock_movements(refund_id, order_item_id, movement_type)
  WHERE refund_id IS NOT NULL AND order_item_id IS NOT NULL;

ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Inventory is accessed through the server-side staff/admin APIs and the
-- security-definer transition functions below. There are no direct client
-- policies for either ledger.

UPDATE public.products
SET stock = 0
WHERE stock IS NULL OR stock < 0;

UPDATE public.products
SET low_stock_threshold = 5
WHERE low_stock_threshold IS NULL OR low_stock_threshold < 0;

UPDATE public.products
SET track_stock = false
WHERE track_stock IS NULL;

ALTER TABLE public.products
  ALTER COLUMN stock SET DEFAULT 0,
  ALTER COLUMN stock SET NOT NULL,
  ALTER COLUMN low_stock_threshold SET DEFAULT 5,
  ALTER COLUMN low_stock_threshold SET NOT NULL,
  ALTER COLUMN track_stock SET DEFAULT false,
  ALTER COLUMN track_stock SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_stock_nonnegative'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_nonnegative CHECK (stock >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_low_stock_threshold_nonnegative'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_low_stock_threshold_nonnegative
      CHECK (low_stock_threshold >= 0);
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS on_order_item_insert ON public.order_items;
DROP TRIGGER IF EXISTS on_order_cancelled ON public.orders;
DROP FUNCTION IF EXISTS public.decrement_stock();
DROP FUNCTION IF EXISTS public.restore_stock_on_cancel();

CREATE OR REPLACE FUNCTION public.reserve_order_stock(p_order_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.orders%ROWTYPE;
  item_row record;
  product_row public.products%ROWTYPE;
  existing_row public.stock_reservations%ROWTYPE;
  reserved_count integer := 0;
  inserted_id uuid;
BEGIN
  SELECT * INTO order_row
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF order_row.id IS NULL THEN
    RAISE EXCEPTION 'order not found';
  END IF;

  IF order_row.status <> 'pending' OR order_row.payment_status <> 'pending_payment' THEN
    RAISE EXCEPTION 'order is not reservable';
  END IF;

  -- Lock products in a deterministic order so concurrent carts cannot
  -- deadlock while reserving several products.
  FOR item_row IN
    SELECT oi.id, oi.product_id, oi.quantity
    FROM public.order_items AS oi
    WHERE oi.order_id = p_order_id
    ORDER BY oi.product_id NULLS LAST, oi.id
  LOOP
    IF item_row.product_id IS NULL THEN
      CONTINUE;
    END IF;

    SELECT * INTO product_row
    FROM public.products
    WHERE id = item_row.product_id
    FOR UPDATE;

    IF product_row.id IS NULL OR NOT product_row.is_active THEN
      RAISE EXCEPTION 'product is unavailable';
    END IF;

    SELECT * INTO existing_row
    FROM public.stock_reservations
    WHERE order_item_id = item_row.id
    FOR UPDATE;

    IF existing_row.id IS NOT NULL THEN
      IF existing_row.quantity <> item_row.quantity
         OR existing_row.product_id <> item_row.product_id
         OR existing_row.status = 'released' THEN
        RAISE EXCEPTION 'order stock reservation is inconsistent';
      END IF;
      reserved_count := reserved_count + 1;
      CONTINUE;
    END IF;

    IF product_row.track_stock AND product_row.stock < item_row.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', item_row.product_id
        USING ERRCODE = 'P0001';
    END IF;

    IF product_row.track_stock THEN
      UPDATE public.products
      SET stock = stock - item_row.quantity,
          updated_at = now()
      WHERE id = item_row.product_id;
    END IF;

    INSERT INTO public.stock_reservations (
      order_id, order_item_id, product_id, quantity, stock_tracked, expires_at
    )
    VALUES (
      p_order_id, item_row.id, item_row.product_id, item_row.quantity,
      product_row.track_stock, now() + interval '24 hours'
    )
    RETURNING id INTO inserted_id;

    IF product_row.track_stock THEN
      INSERT INTO public.stock_movements (
        product_id, order_id, order_item_id, reservation_id,
        quantity_delta, movement_type, reason
      )
      VALUES (
        item_row.product_id, p_order_id, item_row.id, inserted_id,
        -item_row.quantity, 'reserve', 'Checkout inventory reservation'
      );
    END IF;

    reserved_count := reserved_count + 1;
  END LOOP;

  RETURN reserved_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_order_stock(p_order_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  consumed_count integer;
BEGIN
  PERFORM 1 FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;

  UPDATE public.stock_reservations
  SET status = 'consumed', updated_at = now()
  WHERE order_id = p_order_id AND status = 'reserved';

  GET DIAGNOSTICS consumed_count = ROW_COUNT;
  RETURN consumed_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_order_stock(p_order_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reservation_row public.stock_reservations%ROWTYPE;
  released_count integer := 0;
BEGIN
  PERFORM 1 FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;

  FOR reservation_row IN
    SELECT *
    FROM public.stock_reservations
    WHERE order_id = p_order_id AND status = 'reserved'
    ORDER BY product_id, id
    FOR UPDATE
  LOOP
    IF reservation_row.stock_tracked THEN
      UPDATE public.products
      SET stock = stock + reservation_row.quantity,
          updated_at = now()
      WHERE id = reservation_row.product_id;

      INSERT INTO public.stock_movements (
        product_id, order_id, order_item_id, reservation_id,
        quantity_delta, movement_type, reason
      )
      VALUES (
        reservation_row.product_id, p_order_id, reservation_row.order_item_id,
        reservation_row.id, reservation_row.quantity, 'release',
        'Cancelled checkout stock release'
      )
       ON CONFLICT (reservation_id, movement_type)
         WHERE reservation_id IS NOT NULL DO NOTHING;
    END IF;

    UPDATE public.stock_reservations
    SET status = 'released', released_at = now(), updated_at = now()
    WHERE id = reservation_row.id;
    released_count := released_count + 1;
  END LOOP;

  RETURN released_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_order_stock_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'paid'
     AND OLD.payment_status IS DISTINCT FROM 'paid' THEN
    PERFORM public.consume_order_stock(NEW.id);
  END IF;

  IF NEW.payment_status = 'cancelled' OR NEW.status = 'cancelled' THEN
    PERFORM public.release_order_stock(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_sync_stock_state ON public.orders;
CREATE TRIGGER orders_sync_stock_state
  AFTER UPDATE OF status, payment_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_order_stock_state();

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

  requested_items := refund_row.items;
  IF jsonb_array_length(requested_items) = 0 THEN
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

CREATE OR REPLACE FUNCTION public.sync_refund_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.restock_stock_for_refund(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_refunds_restock_stock ON public.order_refunds;
CREATE TRIGGER order_refunds_restock_stock
  AFTER INSERT OR UPDATE OF status, items ON public.order_refunds
  FOR EACH ROW
  WHEN (NEW.status = 'succeeded')
  EXECUTE FUNCTION public.sync_refund_stock();

REVOKE ALL ON FUNCTION public.reserve_order_stock(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_order_stock(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_order_stock(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.restock_stock_for_refund(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_refund_stock() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_order_stock(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_order_stock(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_order_stock(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.restock_stock_for_refund(uuid) TO service_role;
