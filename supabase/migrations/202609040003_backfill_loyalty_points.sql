-- Credit historical paid orders exactly once.
DO $$
DECLARE
  order_row record;
  current_balance integer;
  points_to_add integer;
  points_rate numeric;
BEGIN
  SELECT COALESCE(loyalty_points_per_euro, 1) INTO points_rate
  FROM public.store_settings
  ORDER BY updated_at DESC
  LIMIT 1;
  points_rate := COALESCE(points_rate, 1);

  FOR order_row IN
    SELECT o.id, o.user_id, o.subtotal
    FROM public.orders o
    WHERE o.user_id IS NOT NULL
      AND o.payment_status = 'paid'
      AND NOT EXISTS (
        SELECT 1 FROM public.loyalty_ledger l
        WHERE l.order_id = o.id AND l.type = 'earn'
      )
    ORDER BY o.paid_at NULLS FIRST, o.created_at, o.id
  LOOP
    points_to_add := floor(GREATEST(0, order_row.subtotal) * points_rate);
    IF points_to_add <= 0 THEN
      CONTINUE;
    END IF;

    SELECT p.loyalty_points_balance INTO current_balance
    FROM public.profiles p
    WHERE p.id = order_row.user_id
    FOR UPDATE;

    IF current_balance IS NOT NULL THEN
      current_balance := current_balance + points_to_add;
      UPDATE public.profiles
      SET loyalty_points_balance = current_balance
      WHERE id = order_row.user_id;

      INSERT INTO public.loyalty_ledger(user_id, order_id, type, points, balance_after, description)
      VALUES (order_row.user_id, order_row.id, 'earn', points_to_add, current_balance, 'Points gagnés sur une commande passée');
    END IF;
  END LOOP;
END;
$$;
