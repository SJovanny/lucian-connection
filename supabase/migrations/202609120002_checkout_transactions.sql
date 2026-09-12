-- Make checkout preparation idempotent and keep Stripe webhook retries
-- durable. External Stripe calls remain outside the database transaction, but
-- every local checkout state transition is atomic and retryable.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_session_id
  ON public.orders(payment_session_id)
  WHERE payment_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.checkout_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_key text NOT NULL CHECK (char_length(request_key) BETWEEN 16 AND 200),
  request_fingerprint text NOT NULL CHECK (
    request_fingerprint ~ '^[a-f0-9]{64}$'
  ),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  stripe_session_id text,
  stripe_session_url text,
  status text NOT NULL DEFAULT 'prepared'
    CHECK (status IN ('prepared', 'session_created')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checkout_attempts_user_request_key UNIQUE (user_id, request_key)
);

CREATE INDEX IF NOT EXISTS idx_checkout_attempts_order
  ON public.checkout_attempts(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_attempts_stripe_session
  ON public.checkout_attempts(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'processed', 'failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error_code text,
  locked_until timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_retry
  ON public.stripe_webhook_events(status, locked_until, received_at);

ALTER TABLE public.checkout_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- System-originated payment events need an audit actor distinct from a human
-- staff member. Existing human audit rows remain unchanged.
ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_actor_role_check;
ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_actor_role_check
  CHECK (actor_role IN ('admin', 'employee', 'system'));

CREATE OR REPLACE FUNCTION public.record_system_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_summary text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    actor_id, actor_name, actor_role, action, entity_type, entity_id,
    summary, metadata
  )
  VALUES (
    NULL, 'System', 'system', p_action, p_entity_type, p_entity_id,
    COALESCE(p_summary, p_action), COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.prepare_checkout_order(
  p_user_id uuid,
  p_request_key text,
  p_request_fingerprint text,
  p_phone text,
  p_full_name text,
  p_email text,
  p_notes text,
  p_locale text,
  p_pickup_at timestamptz,
  p_coupon_id uuid,
  p_subtotal_cents bigint,
  p_preparation_fee_cents bigint,
  p_discount_cents bigint,
  p_total_cents bigint,
  p_items jsonb,
  p_contains_alcohol boolean,
  p_age_confirmed boolean,
  p_terms_version text,
  p_user_agent text,
  p_ip_address inet DEFAULT NULL
)
RETURNS TABLE(
  order_id uuid,
  session_id text,
  session_url text,
  is_existing boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_row public.checkout_attempts%ROWTYPE;
  existing_order public.orders%ROWTYPE;
  new_order_id uuid;
  order_item_id uuid;
  item_row record;
  product_row record;
  settings_row record;
  coupon_row record;
  actual_contains_alcohol boolean := false;
  expected_subtotal bigint := 0;
  expected_unit_price bigint;
  expected_total bigint;
  expected_discount bigint;
  reservation_created boolean;
  document_type text;
  item_count integer;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'server checkout is required';
  END IF;

  IF p_user_id IS NULL
     OR p_request_key IS NULL
     OR char_length(p_request_key) < 16
     OR char_length(p_request_key) > 200
     OR p_request_fingerprint IS NULL
     OR char_length(p_request_fingerprint) <> 64 THEN
    RAISE EXCEPTION 'invalid checkout request key';
  END IF;

  IF p_locale IS NULL OR p_locale NOT IN ('fr', 'en')
      OR p_terms_version IS NULL
      OR char_length(p_terms_version) = 0
      OR p_phone IS NULL
     OR char_length(btrim(p_phone)) = 0
     OR p_full_name IS NULL
     OR char_length(btrim(p_full_name)) = 0 THEN
    RAISE EXCEPTION 'invalid checkout contact data';
  END IF;

  IF p_subtotal_cents IS NULL OR p_preparation_fee_cents IS NULL
     OR p_discount_cents IS NULL OR p_total_cents IS NULL
     OR p_subtotal_cents < 0 OR p_preparation_fee_cents < 0
     OR p_discount_cents < 0 OR p_total_cents < 0
     OR p_discount_cents > p_subtotal_cents
     OR p_total_cents <> p_subtotal_cents - p_discount_cents + p_preparation_fee_cents
     OR jsonb_typeof(COALESCE(p_items, '[]'::jsonb)) <> 'array'
     OR jsonb_array_length(COALESCE(p_items, '[]'::jsonb)) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'invalid checkout quote';
  END IF;

  INSERT INTO public.checkout_attempts (user_id, request_key, request_fingerprint)
  VALUES (p_user_id, p_request_key, p_request_fingerprint)
  ON CONFLICT (user_id, request_key) DO NOTHING;

  SELECT * INTO attempt_row
  FROM public.checkout_attempts
  WHERE user_id = p_user_id AND request_key = p_request_key
  FOR UPDATE;

  IF attempt_row.request_fingerprint <> p_request_fingerprint THEN
    RAISE EXCEPTION 'checkout request key was reused with different data';
  END IF;

  IF attempt_row.order_id IS NOT NULL THEN
    SELECT * INTO existing_order
    FROM public.orders
    WHERE id = attempt_row.order_id
    FOR UPDATE;

    IF existing_order.id IS NOT NULL
       AND (
         existing_order.payment_status IN ('paid', 'partially_refunded')
         OR (
           existing_order.payment_status = 'pending_payment'
           AND existing_order.status = 'pending'
         )
       ) THEN
      RETURN QUERY SELECT
        existing_order.id,
        COALESCE(attempt_row.stripe_session_id, existing_order.payment_session_id),
        attempt_row.stripe_session_url,
        true;
      RETURN;
    END IF;

    RAISE EXCEPTION 'checkout request was cancelled';
  END IF;

  SELECT preparation_fee, min_order_amount
  INTO settings_row
  FROM public.store_settings
  ORDER BY updated_at DESC
  LIMIT 1
  FOR UPDATE;
  IF settings_row IS NULL THEN RAISE EXCEPTION 'store settings unavailable'; END IF;

  IF settings_row.preparation_fee IS NULL
     OR settings_row.min_order_amount IS NULL
     OR round(settings_row.preparation_fee * 100)::bigint <> p_preparation_fee_cents
     OR p_subtotal_cents < round(settings_row.min_order_amount * 100)::bigint THEN
    RAISE EXCEPTION 'checkout quote is stale';
  END IF;

  SELECT count(*) INTO item_count
  FROM jsonb_to_recordset(p_items)
    AS x(product_id uuid, product_name text, quantity integer,
         unit_price_cents bigint, total_price_cents bigint);
  IF item_count = 0 OR EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_items)
      AS x(product_id uuid, product_name text, quantity integer,
          unit_price_cents bigint, total_price_cents bigint)
    GROUP BY product_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'invalid checkout items';
  END IF;

  -- Validate every quoted price against the locked current product row. The
  -- subsequent stock function locks the same rows before decrementing them.
  FOR item_row IN
    SELECT x.*
    FROM jsonb_to_recordset(p_items)
      AS x(product_id uuid, product_name text, quantity integer,
          unit_price_cents bigint, total_price_cents bigint)
    ORDER BY x.product_id
  LOOP
    IF item_row.product_id IS NULL OR item_row.quantity IS NULL
       OR item_row.quantity < 1 OR item_row.quantity > 100
       OR item_row.product_name IS NULL OR char_length(item_row.product_name) = 0
       OR item_row.unit_price_cents IS NULL OR item_row.unit_price_cents < 0
       OR item_row.total_price_cents IS NULL OR item_row.total_price_cents < 0 THEN
      RAISE EXCEPTION 'invalid checkout item';
    END IF;

    SELECT p.id, p.price, p.translations, p.is_alcoholic, p.is_active,
      calculate_discounted_price(p.id, p.price) AS discounted_price
    INTO product_row
    FROM public.products AS p
    WHERE p.id = item_row.product_id
    FOR UPDATE;

    IF product_row.id IS NULL OR NOT product_row.is_active THEN
      RAISE EXCEPTION 'product is unavailable';
    END IF;

    expected_unit_price := round((CASE
      WHEN product_row.discounted_price IS NOT NULL
       AND product_row.discounted_price < product_row.price
        THEN product_row.discounted_price
      ELSE product_row.price
    END) * 100)::bigint;

    IF item_row.unit_price_cents <> expected_unit_price
       OR item_row.total_price_cents <> expected_unit_price * item_row.quantity THEN
      RAISE EXCEPTION 'checkout quote is stale';
    END IF;

    expected_subtotal := expected_subtotal + item_row.total_price_cents;
    actual_contains_alcohol := actual_contains_alcohol OR product_row.is_alcoholic;
  END LOOP;

  IF expected_subtotal <> p_subtotal_cents
     OR actual_contains_alcohol IS DISTINCT FROM COALESCE(p_contains_alcohol, false)
     OR (actual_contains_alcohol AND p_age_confirmed IS NOT TRUE) THEN
    RAISE EXCEPTION 'checkout quote is invalid';
  END IF;

  IF p_coupon_id IS NULL THEN
    IF p_discount_cents <> 0 THEN
      RAISE EXCEPTION 'checkout quote is stale';
    END IF;
  ELSE
    -- Recheck the coupon while holding its row lock. The public quote can be
    -- stale by the time this transaction reaches the inventory reservation.
    SELECT * INTO coupon_row
    FROM public.coupons
    WHERE id = p_coupon_id
    FOR UPDATE;

    IF coupon_row.id IS NULL
       OR NOT coupon_row.is_active
       OR (coupon_row.starts_at IS NOT NULL AND coupon_row.starts_at > now())
       OR (coupon_row.expires_at IS NOT NULL AND coupon_row.expires_at < now())
       OR coupon_row.discount_type NOT IN ('percentage', 'fixed')
       OR coupon_row.discount_value IS NULL
       OR coupon_row.discount_value <= 0
       OR coupon_row.discount_value::text IN ('NaN', 'Infinity', '-Infinity')
       OR (coupon_row.discount_type = 'percentage' AND coupon_row.discount_value > 100)
       OR coupon_row.min_order_amount IS NULL
       OR coupon_row.min_order_amount < 0
       OR (coupon_row.max_discount_amount IS NOT NULL AND coupon_row.max_discount_amount < 0)
       OR p_subtotal_cents < round(coupon_row.min_order_amount * 100)::bigint
       OR (coupon_row.user_id IS NOT NULL AND coupon_row.user_id <> p_user_id) THEN
      RAISE EXCEPTION 'coupon unavailable';
    END IF;

    expected_discount := CASE
      WHEN coupon_row.discount_type = 'percentage'
        THEN round(p_subtotal_cents::numeric * coupon_row.discount_value / 100)::bigint
      ELSE round(coupon_row.discount_value * 100)::bigint
    END;
    IF coupon_row.max_discount_amount IS NOT NULL THEN
      expected_discount := LEAST(
        expected_discount,
        round(coupon_row.max_discount_amount * 100)::bigint
      );
    END IF;
    expected_discount := LEAST(GREATEST(expected_discount, 0), p_subtotal_cents);
    IF p_discount_cents <> expected_discount THEN
      RAISE EXCEPTION 'checkout quote is stale';
    END IF;
  END IF;

  INSERT INTO public.orders (
    user_id, status, payment_status, payment_provider, subtotal,
    delivery_fee, total_amount, phone, notes, locale, coupon_id,
    discount_amount, pickup_at, terms_version, contains_alcohol,
    age_confirmed_at
  )
  VALUES (
    p_user_id, 'pending', 'pending_payment', 'stripe',
    p_subtotal_cents / 100.0, p_preparation_fee_cents / 100.0,
    p_total_cents / 100.0, btrim(p_phone), NULLIF(btrim(p_notes), ''),
    p_locale, p_coupon_id, p_discount_cents / 100.0, p_pickup_at,
    p_terms_version, actual_contains_alcohol,
    CASE WHEN actual_contains_alcohol THEN now() ELSE NULL END
  )
  RETURNING id INTO new_order_id;
  order_id := new_order_id;

  UPDATE public.profiles
  SET full_name = btrim(p_full_name), phone = btrim(p_phone), updated_at = now()
  WHERE id = p_user_id;

  FOR item_row IN
    SELECT x.*
    FROM jsonb_to_recordset(p_items)
      AS x(product_id uuid, product_name text, quantity integer,
          unit_price_cents bigint, total_price_cents bigint)
    ORDER BY x.product_id
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_name, quantity, unit_price, total_price
    )
    VALUES (
      new_order_id, item_row.product_id, item_row.product_name,
      item_row.quantity, item_row.unit_price_cents / 100.0,
      item_row.total_price_cents / 100.0
    )
    RETURNING id INTO order_item_id;
  END LOOP;

  IF actual_contains_alcohol THEN
    FOREACH document_type IN ARRAY ARRAY['terms', 'pickup_refunds', 'alcohol_age'] LOOP
      INSERT INTO public.legal_acceptances (
        user_id, document_type, document_version, order_id,
        user_agent, ip_address
      )
      VALUES (
        p_user_id, document_type, p_terms_version, new_order_id,
        p_user_agent, p_ip_address
      );
    END LOOP;
  ELSE
    FOREACH document_type IN ARRAY ARRAY['terms', 'pickup_refunds'] LOOP
      INSERT INTO public.legal_acceptances (
        user_id, document_type, document_version, order_id,
        user_agent, ip_address
      )
      VALUES (
        p_user_id, document_type, p_terms_version, new_order_id,
        p_user_agent, p_ip_address
      );
    END LOOP;
  END IF;

  IF p_coupon_id IS NOT NULL THEN
    SELECT public.reserve_coupon(p_coupon_id, new_order_id, p_user_id)
    INTO reservation_created;
    IF reservation_created IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'coupon reservation unavailable';
    END IF;
  END IF;

  PERFORM public.reserve_order_stock(new_order_id);

  UPDATE public.checkout_attempts
  SET order_id = new_order_id, status = 'prepared', updated_at = now()
  WHERE id = attempt_row.id;

  RETURN QUERY SELECT new_order_id, NULL::text, NULL::text, false;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_checkout_session(
  p_user_id uuid,
  p_request_key text,
  p_order_id uuid,
  p_session_id text,
  p_session_url text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_row public.checkout_attempts%ROWTYPE;
  order_row public.orders%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'server checkout is required';
  END IF;
  IF p_session_id IS NULL OR char_length(p_session_id) > 255
     OR p_session_url IS NULL OR char_length(p_session_url) > 2000
     OR p_session_id !~ '^cs_(test_|live_)?[A-Za-z0-9]+$' THEN
    RAISE EXCEPTION 'invalid checkout session';
  END IF;

  SELECT * INTO attempt_row
  FROM public.checkout_attempts
  WHERE user_id = p_user_id AND request_key = p_request_key
  FOR UPDATE;
  IF attempt_row.id IS NULL OR attempt_row.order_id <> p_order_id THEN
    RAISE EXCEPTION 'checkout attempt not found';
  END IF;

  IF attempt_row.stripe_session_id IS NOT NULL
     AND attempt_row.stripe_session_id <> p_session_id THEN
    RAISE EXCEPTION 'checkout session cannot be changed';
  END IF;

  SELECT * INTO order_row
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;
  IF order_row.id IS NULL THEN
    RAISE EXCEPTION 'checkout order is no longer pending';
  END IF;

   IF order_row.payment_status = 'pending_payment' THEN
     IF order_row.status <> 'pending' THEN
       RAISE EXCEPTION 'checkout order is no longer pending';
     END IF;
    IF order_row.payment_session_id IS NOT NULL
       AND order_row.payment_session_id <> p_session_id THEN
      RAISE EXCEPTION 'checkout session cannot be changed';
    END IF;
  ELSIF order_row.payment_status IN ('paid', 'partially_refunded')
     AND order_row.payment_session_id = p_session_id THEN
    -- A fast webhook may have finalized the order before this request linked
    -- the session. The webhook stored the same session ID, so this link is safe.
    NULL;
  ELSE
    RAISE EXCEPTION 'checkout order is no longer pending';
  END IF;

  UPDATE public.checkout_attempts
  SET stripe_session_id = p_session_id,
      stripe_session_url = p_session_url,
      status = 'session_created',
      updated_at = now()
  WHERE id = attempt_row.id;

  UPDATE public.orders
  SET payment_session_id = p_session_id, updated_at = now()
  WHERE id = p_order_id
    AND payment_status = 'pending_payment';

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_stripe_webhook_event(
  p_event_id text,
  p_event_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_row public.stripe_webhook_events%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role'
     OR p_event_id IS NULL OR char_length(p_event_id) > 255
     OR p_event_type IS NULL OR char_length(p_event_type) > 160 THEN
    RAISE EXCEPTION 'invalid webhook event';
  END IF;

  INSERT INTO public.stripe_webhook_events (stripe_event_id, event_type)
  VALUES (p_event_id, p_event_type)
  ON CONFLICT (stripe_event_id) DO NOTHING;

  SELECT * INTO event_row
  FROM public.stripe_webhook_events
  WHERE stripe_event_id = p_event_id
  FOR UPDATE;

  IF event_row.status = 'processed' THEN RETURN false; END IF;
  IF event_row.status = 'processing'
     AND event_row.locked_until IS NOT NULL
     AND event_row.locked_until > now() THEN
    RETURN false;
  END IF;

  UPDATE public.stripe_webhook_events
  SET status = 'processing', attempts = event_row.attempts + 1,
      locked_until = now() + interval '5 minutes',
      updated_at = now()
  WHERE id = event_row.id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_stripe_webhook_event(p_event_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stripe_webhook_events
  SET status = 'processed', processed_at = now(), locked_until = NULL,
      last_error_code = NULL, updated_at = now()
  WHERE stripe_event_id = p_event_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_stripe_webhook_event(
  p_event_id text,
  p_error_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stripe_webhook_events
  SET status = 'failed', locked_until = NULL,
      last_error_code = left(COALESCE(p_error_code, 'unknown'), 160),
      updated_at = now()
  WHERE stripe_event_id = p_event_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_paid_order(
  p_order_id uuid,
  p_session_id text,
  p_payment_intent text,
  p_event_id text DEFAULT NULL
)
RETURNS TABLE(payment_status text, processed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.orders%ROWTYPE;
  settings_row record;
  rate numeric;
  points integer;
  transitioned boolean := false;
  current_reference text;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'server payment finalization is required';
  END IF;

  IF p_session_id IS NULL
     OR p_session_id !~ '^cs_(test_|live_)?[A-Za-z0-9]+$'
     OR p_payment_intent IS NULL
     OR p_payment_intent !~ '^pi_[A-Za-z0-9]+$' THEN
    RAISE EXCEPTION 'invalid payment confirmation';
  END IF;

  SELECT * INTO order_row
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;
  IF order_row.id IS NULL THEN RAISE EXCEPTION 'order not found'; END IF;

  IF order_row.payment_session_id IS NOT NULL
     AND order_row.payment_session_id IS DISTINCT FROM p_session_id THEN
    RAISE EXCEPTION 'payment session does not belong to order';
  END IF;

  IF order_row.payment_session_id IS NULL
     AND order_row.payment_reference IS NOT NULL
     AND order_row.payment_reference LIKE 'cs_%'
     AND order_row.payment_reference IS DISTINCT FROM p_session_id THEN
    RAISE EXCEPTION 'payment session does not belong to order';
  END IF;

  IF order_row.payment_status IN ('cancelled', 'refunded') THEN
    RETURN QUERY SELECT order_row.payment_status, false;
    RETURN;
  END IF;

  IF order_row.payment_status = 'pending_payment'
     AND order_row.status <> 'pending' THEN
    RAISE EXCEPTION 'order is not payable';
  END IF;

  IF order_row.payment_session_id IS NULL THEN
    UPDATE public.orders
    SET payment_session_id = p_session_id, updated_at = now()
    WHERE id = p_order_id;
    order_row.payment_session_id := p_session_id;
  END IF;

  current_reference := order_row.payment_reference;
  IF current_reference IS NOT NULL
     AND current_reference LIKE 'pi_%'
     AND p_payment_intent IS DISTINCT FROM current_reference THEN
    RAISE EXCEPTION 'payment intent does not belong to order';
  END IF;

  IF order_row.payment_status = 'pending_payment' THEN
    UPDATE public.orders
    SET payment_status = 'paid', payment_provider = 'stripe',
        payment_reference = COALESCE(p_payment_intent, p_session_id),
        paid_at = COALESCE(paid_at, now()), updated_at = now()
    WHERE id = p_order_id;
    transitioned := true;
  ELSIF order_row.payment_status NOT IN ('paid', 'partially_refunded') THEN
    RAISE EXCEPTION 'order is not payable';
  ELSIF current_reference IS NULL AND p_payment_intent IS NOT NULL THEN
    UPDATE public.orders
    SET payment_reference = p_payment_intent, updated_at = now()
    WHERE id = p_order_id;
  END IF;

  IF order_row.user_id IS NOT NULL THEN
    SELECT loyalty_points_per_euro INTO rate
    FROM public.store_settings
    ORDER BY updated_at DESC
    LIMIT 1
    FOR UPDATE;
    IF rate IS NULL OR rate < 0 OR rate::text IN ('NaN', 'Infinity', '-Infinity') THEN
      RAISE EXCEPTION 'loyalty settings unavailable';
    END IF;
  END IF;

  IF order_row.coupon_id IS NOT NULL THEN
    PERFORM public.use_coupon(order_row.coupon_id, p_order_id, order_row.user_id);
  END IF;

  IF order_row.user_id IS NOT NULL THEN
    points := floor(GREATEST(0, order_row.subtotal) * rate);
    PERFORM public.loyalty_earn_points(
      order_row.user_id, p_order_id, points,
      'Points gagnes sur la commande #' || left(p_order_id::text, 8)
    );
  END IF;

  IF transitioned THEN
    PERFORM public.record_system_audit_event(
      'order.payment_succeeded', 'order', p_order_id,
      'Payment confirmed for order',
      jsonb_build_object('event_id', p_event_id, 'payment_intent', p_payment_intent)
    );
  END IF;

  RETURN QUERY SELECT
    CASE WHEN order_row.payment_status = 'partially_refunded' THEN 'partially_refunded' ELSE 'paid' END,
    true;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_pending_order(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_row public.orders%ROWTYPE;
  changed boolean := false;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'server order cancellation is required';
  END IF;

  SELECT * INTO order_row
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;
  IF order_row.id IS NULL THEN RAISE EXCEPTION 'order not found'; END IF;

  IF order_row.payment_status = 'pending_payment' THEN
    UPDATE public.orders
    SET payment_status = 'cancelled', status = 'cancelled', updated_at = now()
    WHERE id = p_order_id;
    changed := true;
  ELSIF order_row.payment_status NOT IN ('cancelled', 'payment_failed') THEN
    RETURN false;
  END IF;

  PERFORM public.release_order_stock(p_order_id);
  PERFORM public.release_coupon_reservation(p_order_id, NULL);

  IF changed THEN
    PERFORM public.record_system_audit_event(
      'order.payment_cancelled', 'order', p_order_id,
      'Pending payment order cancelled'
    );
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_abandoned_orders(
  p_max_age interval DEFAULT interval '24 hours'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_id uuid;
  cancelled_count integer := 0;
BEGIN
  IF p_max_age IS NULL OR p_max_age <= interval '0' THEN
    RAISE EXCEPTION 'invalid abandoned-order age';
  END IF;

  FOR order_id IN
    SELECT id
    FROM public.orders
    WHERE payment_status = 'pending_payment'
      AND status = 'pending'
      AND created_at < now() - p_max_age
    ORDER BY created_at, id
    FOR UPDATE SKIP LOCKED
  LOOP
    IF public.cancel_pending_order(order_id) THEN
      cancelled_count := cancelled_count + 1;
    END IF;
  END LOOP;
  RETURN cancelled_count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_system_audit_event(text, text, uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prepare_checkout_order(uuid, text, text, text, text, text, text, text, timestamptz, uuid, bigint, bigint, bigint, bigint, jsonb, boolean, boolean, text, text, inet) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.link_checkout_session(uuid, text, uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_stripe_webhook_event(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_stripe_webhook_event(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fail_stripe_webhook_event(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_paid_order(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_pending_order(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_abandoned_orders(interval) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_system_audit_event(text, text, uuid, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.prepare_checkout_order(uuid, text, text, text, text, text, text, text, timestamptz, uuid, bigint, bigint, bigint, bigint, jsonb, boolean, boolean, text, text, inet) TO service_role;
GRANT EXECUTE ON FUNCTION public.link_checkout_session(uuid, text, uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_stripe_webhook_event(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_stripe_webhook_event(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_stripe_webhook_event(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_paid_order(uuid, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_pending_order(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_abandoned_orders(interval) TO service_role;
