DROP POLICY IF EXISTS "Admins can manage refunds" ON public.order_refunds;
CREATE POLICY "Admins can manage refunds"
  ON public.order_refunds FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
