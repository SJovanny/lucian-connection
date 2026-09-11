-- Keep the staff dashboard synchronized when orders are created or updated.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

-- Include previous values in UPDATE events so the UI only announces status changes.
ALTER TABLE public.orders REPLICA IDENTITY FULL;
