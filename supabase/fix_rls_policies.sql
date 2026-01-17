-- Fix RLS policies to avoid infinite recursion
-- The problem: When checking admin access on products/categories,
-- the policy tries to SELECT from profiles, which triggers profiles' RLS,
-- creating infinite recursion.
-- 
-- Solution: Simplify the policies to avoid nested SELECT from profiles
-- when profiles RLS is also checking admin status.

BEGIN;

-- ============================================
-- PROFILES POLICIES FIX
-- ============================================

-- Drop all profiles policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate profiles policies without recursion
-- Users can always view and update their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles - use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "profiles_admin_select_all"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- ============================================
-- PRODUCTS POLICIES FIX
-- ============================================

DROP POLICY IF EXISTS "Active products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Products are editable by admins" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Public can view active products
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (is_active = true);

-- Admins can manage all products
CREATE POLICY "products_admin_all"
  ON products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- CATEGORIES POLICIES FIX
-- ============================================

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories are editable by admins" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Public can view all categories
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (true);

-- Admins can manage categories
CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- ORDERS POLICIES FIX
-- ============================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Users can view and create own orders
CREATE POLICY "orders_user_select"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders_user_insert"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and update all orders
CREATE POLICY "orders_admin_select"
  ON orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- ORDER ITEMS POLICIES FIX
-- ============================================

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON order_items;

-- Users can view their own order items
CREATE POLICY "order_items_user_select"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Users can create order items for their own orders
CREATE POLICY "order_items_user_insert"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "order_items_admin_select"
  ON order_items FOR SELECT
  USING (public.is_admin());

COMMIT;
