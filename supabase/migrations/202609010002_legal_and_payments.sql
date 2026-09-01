ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_version text;

CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_version text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user_document
  ON public.legal_acceptances (user_id, document_type, accepted_at DESC);

ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create their own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can create their own legal acceptances"
  ON public.legal_acceptances FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can view their own legal acceptances"
  ON public.legal_acceptances FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
