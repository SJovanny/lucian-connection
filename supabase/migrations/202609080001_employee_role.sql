-- Employees can use the operational dashboard, while only admins manage users.

ALTER TYPE public.role_enum ADD VALUE IF NOT EXISTS 'employee';

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name text;
BEGIN
  display_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), '')
  );

  INSERT INTO public.profiles (id, full_name, role, dashboard_locale)
  VALUES (NEW.id, display_name, 'customer'::public.role_enum, 'fr')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin'::public.role_enum, 'employee'::public.role_enum)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'::public.role_enum
  );
$$;

-- Existing dashboard policies use is_admin() for operational actions.
-- Keep that API compatible while allowing employees to perform those actions.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_staff();
$$;

DROP POLICY IF EXISTS "Admins can select profiles" ON public.profiles;
CREATE POLICY "Admins can select profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_admin_user()
  );
