-- Fix recursive RLS policies by using a security definer function

-- 1. Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role text;
BEGIN
  SELECT role INTO current_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop existing problematic policies

-- Categories
DROP POLICY IF EXISTS "Categories are editable by admins" ON categories;

-- Products
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Products are editable by admins" ON products;

-- Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- 3. Re-create policies using the new is_admin() function

-- Categories
CREATE POLICY "Categories are editable by admins" 
  ON categories FOR ALL 
  USING (is_admin());

-- Products
CREATE POLICY "Admins can view all products" 
  ON products FOR SELECT 
  USING (is_admin());

CREATE POLICY "Products are editable by admins" 
  ON products FOR ALL 
  USING (is_admin());

-- Profiles
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (is_admin());

-- Orders
CREATE POLICY "Admins can view all orders" 
  ON orders FOR SELECT 
  USING (is_admin());

CREATE POLICY "Admins can update orders" 
  ON orders FOR UPDATE 
  USING (is_admin());

-- Order Items
CREATE POLICY "Admins can view all order items" 
  ON order_items FOR SELECT 
  USING (is_admin());
