-- Store settings are editable from the admin dashboard and the order minimum
-- may be set to zero when the store does not require a minimum order.

ALTER TABLE public.store_settings
  DROP CONSTRAINT IF EXISTS store_settings_min_order_amount_floor;

ALTER TABLE public.store_settings
  ADD CONSTRAINT store_settings_min_order_amount_nonnegative
  CHECK (min_order_amount >= 0);

DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;
CREATE POLICY "Admins can manage store settings"
  ON public.store_settings FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());
