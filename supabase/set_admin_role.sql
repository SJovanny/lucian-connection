-- Set a user as admin by their email
-- Replace 'your-admin-email@example.com' with the actual admin email

-- ============================================
-- OPTION A: If role column is TEXT type
-- ============================================
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'jovanny1647@gmail.com'
);

-- ============================================
-- OPTION B: If you want to use ENUM type
-- Run these commands FIRST to create the ENUM:
-- ============================================
-- CREATE TYPE user_role AS ENUM ('customer', 'admin');
-- 
-- ALTER TABLE public.profiles 
--   ALTER COLUMN role DROP DEFAULT,
--   ALTER COLUMN role TYPE user_role USING role::user_role,
--   ALTER COLUMN role SET DEFAULT 'customer';
-- 
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
--
-- Then use:
-- UPDATE public.profiles
-- SET role = 'admin'::user_role, updated_at = now()
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'
-- );

-- ============================================
-- Verify the update
-- ============================================
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';

-- Alternative: Set admin by user ID
-- UPDATE public.profiles
-- SET role = 'admin', updated_at = now()
-- WHERE id = 'your-user-uuid-here';
