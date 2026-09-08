-- Audit log for staff (admin/employee) activity in the admin dashboard.
-- Writes only happen through the record_audit_event() SECURITY DEFINER
-- function, so the acting user is always stamped server-side from auth.uid()
-- and cannot be spoofed by the client.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text,
  actor_email text,
  actor_role text NOT NULL CHECK (actor_role IN ('admin', 'employee')),
  action text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN (
    'product',
    'category',
    'coupon',
    'reduction',
    'order',
    'store_settings',
    'pickup_opening_hours',
    'pickup_closure',
    'loyalty_reward',
    'user',
    'auth'
  )),
  entity_id uuid,
  summary text NOT NULL,
  changes jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read the audit trail. Employees are the ones being
-- audited, so they do not get visibility into each other's activity.
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

-- No direct INSERT/UPDATE/DELETE policies: all writes go through
-- record_audit_event(), which runs as SECURITY DEFINER and therefore
-- bypasses RLS the same way the loyalty ledger functions do.

CREATE OR REPLACE FUNCTION public.record_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_summary text DEFAULT NULL,
  p_changes jsonb DEFAULT '[]'::jsonb,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_actor_role text;
  v_actor_name text;
  v_actor_email text;
  v_log_id uuid;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT role::text, full_name INTO v_actor_role, v_actor_name
  FROM public.profiles
  WHERE id = v_actor_id;

  IF v_actor_role IS NULL OR v_actor_role NOT IN ('admin', 'employee') THEN
    RAISE EXCEPTION 'Only staff members can record audit events';
  END IF;

  SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor_id;

  INSERT INTO public.audit_logs (
    actor_id, actor_name, actor_email, actor_role,
    action, entity_type, entity_id, summary, changes, metadata,
    ip_address, user_agent
  )
  VALUES (
    v_actor_id, v_actor_name, v_actor_email, v_actor_role,
    p_action, p_entity_type, p_entity_id, COALESCE(p_summary, p_action), p_changes, p_metadata,
    p_ip_address, p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_audit_event(text, text, uuid, text, jsonb, jsonb, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_audit_event(text, text, uuid, text, jsonb, jsonb, text, text) TO authenticated;

-- Retention: called nightly by the purge-audit-logs cron via the
-- service-role client. Not reachable by authenticated/anon.
CREATE OR REPLACE FUNCTION public.purge_audit_logs(p_retention_days integer DEFAULT 180)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < now() - (p_retention_days || ' days')::interval;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_audit_logs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_audit_logs(integer) TO service_role;
