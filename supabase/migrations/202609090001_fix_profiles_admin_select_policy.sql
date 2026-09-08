-- The "Admins can select profiles" policy was created using is_admin_user(),
-- which only matches role = 'admin'. This unintentionally excludes staff with
-- role = 'employee' from reading other users' profiles (e.g. customer name/
-- phone embedded in admin order queries), even though is_admin() already
-- delegates to is_staff() precisely to keep employees at parity with admins
-- for operational read access.
DROP POLICY IF EXISTS "Admins can select profiles" ON public.profiles;
CREATE POLICY "Admins can select profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
  );
