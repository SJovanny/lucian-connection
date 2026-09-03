-- Weekly pickup opening hours, editable by administrators.
CREATE TABLE IF NOT EXISTS public.pickup_opening_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL UNIQUE CHECK (weekday BETWEEN 0 AND 6),
  is_open boolean NOT NULL DEFAULT false,
  start_time time,
  end_time time,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT pickup_opening_hours_times_valid CHECK (
    (is_open = false AND start_time IS NULL AND end_time IS NULL)
    OR (is_open = true AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

INSERT INTO public.pickup_opening_hours (weekday, is_open, start_time, end_time)
VALUES
  (0, false, NULL, NULL),
  (1, true, time '09:00', time '18:00'),
  (2, true, time '09:00', time '18:00'),
  (3, true, time '09:00', time '18:00'),
  (4, true, time '09:00', time '18:00'),
  (5, true, time '09:00', time '18:00'),
  (6, true, time '08:00', time '13:00')
ON CONFLICT (weekday) DO NOTHING;

ALTER TABLE public.pickup_opening_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view pickup opening hours" ON public.pickup_opening_hours;
CREATE POLICY "Anyone can view pickup opening hours"
  ON public.pickup_opening_hours FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage pickup opening hours" ON public.pickup_opening_hours;
CREATE POLICY "Admins can manage pickup opening hours"
  ON public.pickup_opening_hours FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

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
  opening pickup_opening_hours%ROWTYPE;
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

  SELECT * INTO opening
  FROM public.pickup_opening_hours
  WHERE weekday = extract(dow FROM local_date)::smallint;

  IF NOT FOUND OR NOT opening.is_open
     OR local_time < opening.start_time
     OR local_time > opening.end_time
     OR extract(second FROM local_time) <> 0
     OR extract(minute FROM local_time)::int % 30 <> 0 THEN
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
