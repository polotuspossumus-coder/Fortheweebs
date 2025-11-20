-- Bug Reports Table for Self-Healing System
-- Stores user-submitted bug reports and Mico's triage analysis

CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT,
  tier TEXT,

  -- Bug Details
  description TEXT NOT NULL,
  logs JSONB DEFAULT '[]'::jsonb,
  user_agent TEXT,
  url TEXT,

  -- Triage Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'triaged', 'pending_fix', 'fixed', 'discarded', 'spam', 'malicious')),
  priority TEXT DEFAULT 'low' CHECK (priority IN ('critical', 'high', 'medium', 'low', 'none')),
  category TEXT CHECK (category IN ('ui', 'payment', 'upload', 'performance', 'security', 'other')),
  auto_fixable BOOLEAN DEFAULT false,

  -- Mico Analysis
  mico_analysis JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  triaged_at TIMESTAMPTZ,
  fix_attempted_at TIMESTAMPTZ,
  fixed_at TIMESTAMPTZ,

  -- Indexes for performance
  CONSTRAINT bug_reports_user_id_idx CHECK (user_id IS NOT NULL)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_priority ON bug_reports(priority);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own bug reports
CREATE POLICY bug_reports_user_select ON bug_reports
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own bug reports
CREATE POLICY bug_reports_user_insert ON bug_reports
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Only service role can update/delete (for Mico)
CREATE POLICY bug_reports_service_all ON bug_reports
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE bug_reports IS 'User-submitted bug reports triaged by Mico AI for self-healing platform';
COMMENT ON COLUMN bug_reports.status IS 'Current state: pending (new), triaged (analyzed), pending_fix (auto-fix queued), fixed (resolved), discarded (not actionable), spam (junk), malicious (attack attempt)';
COMMENT ON COLUMN bug_reports.mico_analysis IS 'JSON containing Mico''s reasoning, suggested fix, and analysis timestamp';
