-- Pickup scheduling: nullable for historical orders, validated for new/changed slots.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pickup_at timestamptz;

CREATE TABLE IF NOT EXISTS public.pickup_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  closed_on date NOT NULL UNIQUE,
  reason text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_pickup_at_planned
  ON public.orders (pickup_at)
  WHERE pickup_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.validate_order_pickup_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  local_pickup timestamp;
  local_date date;
  local_time time;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.pickup_at IS NULL THEN
    RAISE EXCEPTION 'pickup_at is required for new orders'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_pickup_at_required';
  END IF;

  IF NEW.pickup_at IS NULL THEN
    RETURN NEW;
  END IF;

  local_pickup := NEW.pickup_at AT TIME ZONE 'America/Martinique';
  local_date := local_pickup::date;
  local_time := local_pickup::time;

  IF extract(isodow FROM local_date) NOT BETWEEN 1 AND 5
     OR local_time < time '09:00'
     OR local_time > time '18:00'
     OR extract(minute FROM local_time) NOT IN (0, 30)
     OR (local_time = time '18:30') THEN
    RAISE EXCEPTION 'pickup slot is outside opening hours'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_pickup_at_valid';
  END IF;

  IF NEW.pickup_at < now() + interval '30 minutes' THEN
    RAISE EXCEPTION 'pickup slot is too soon'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_pickup_at_valid';
  END IF;

  IF local_date < (now() AT TIME ZONE 'America/Martinique')::date
     OR local_date > (now() AT TIME ZONE 'America/Martinique')::date + 6 THEN
    RAISE EXCEPTION 'pickup slot is outside booking window'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_pickup_at_valid';
  END IF;

  IF EXISTS (SELECT 1 FROM public.pickup_closures WHERE closed_on = local_date) THEN
    RAISE EXCEPTION 'pickup date is closed'
      USING ERRCODE = '23514', CONSTRAINT = 'orders_pickup_at_closed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_validate_pickup_at ON public.orders;
CREATE TRIGGER orders_validate_pickup_at
  BEFORE INSERT OR UPDATE OF pickup_at ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_pickup_at();

-- The API requires an authenticated user; do not leave an unrestricted insert policy.
DROP POLICY IF EXISTS anon_insert_orders ON public.orders;

ALTER TABLE public.pickup_closures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage pickup closures" ON public.pickup_closures;
CREATE POLICY "Admins can manage pickup closures"
  ON public.pickup_closures FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Availability only needs dates. Internal reasons must not be exposed by the public API.
CREATE OR REPLACE FUNCTION public.get_pickup_closed_dates()
RETURNS TABLE (closed_on date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pc.closed_on
  FROM public.pickup_closures AS pc
  WHERE pc.closed_on BETWEEN
    (now() AT TIME ZONE 'America/Martinique')::date
    AND (now() AT TIME ZONE 'America/Martinique')::date + 6;
$$;

REVOKE ALL ON FUNCTION public.get_pickup_closed_dates() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pickup_closed_dates() TO anon, authenticated;
