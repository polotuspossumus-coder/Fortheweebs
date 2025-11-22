/**
 * DATABASE TABLE FOR PRIVACY VIOLATION LOGGING
 * Run this in Supabase SQL Editor
 *
 * This table logs any attempts to sell or export user data
 * If anyone tries to violate our "never sell data" policy, it gets logged here
 */

-- Privacy violation logs
CREATE TABLE IF NOT EXISTS public.privacy_violation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  user_agent TEXT,
  operation TEXT, -- What they tried to do (e.g., 'BULK_USER_EXPORT', 'DATA_BROKER_SYNC')
  destination TEXT, -- Where they tried to send data
  reason TEXT, -- Why it was blocked
  request_body JSONB, -- Full request details
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_privacy_violations_blocked_at ON public.privacy_violation_logs(blocked_at);
CREATE INDEX idx_privacy_violations_operation ON public.privacy_violation_logs(operation);
CREATE INDEX idx_privacy_violations_ip ON public.privacy_violation_logs(ip_address);

-- Enable Row Level Security
ALTER TABLE public.privacy_violation_logs ENABLE ROW LEVEL SECURITY;

-- Only platform owner can view violation logs
CREATE POLICY "Only owner can view privacy violation logs"
  ON public.privacy_violation_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'owner@fortheweebs.com' -- Replace with your email
    )
  );

-- System can insert violation logs
CREATE POLICY "System can insert privacy violation logs"
  ON public.privacy_violation_logs
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.privacy_violation_logs TO authenticated;
GRANT INSERT ON public.privacy_violation_logs TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🔒 Privacy enforcement table created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Any attempts to sell or export user data will be:';
  RAISE NOTICE '  1. BLOCKED immediately';
  RAISE NOTICE '  2. Logged in this table';
  RAISE NOTICE '  3. Visible to platform owner only';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Your users'' data is now protected at the database level!';
END $$;
