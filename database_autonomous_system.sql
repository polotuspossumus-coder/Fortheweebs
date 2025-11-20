-- Autonomous System Database Tables
-- For self-healing debugger and Mico suggestions

-- Update bug_reports table (if it exists from previous migration)
ALTER TABLE bug_reports ADD COLUMN IF NOT EXISTS routed_to_claude BOOLEAN DEFAULT false;
ALTER TABLE bug_reports ADD COLUMN IF NOT EXISTS claude_analysis JSONB;
ALTER TABLE bug_reports ADD COLUMN IF NOT EXISTS pr_url TEXT;
ALTER TABLE bug_reports ADD COLUMN IF NOT EXISTS pr_number INTEGER;

-- Suggestions table (Mico feature suggestions)
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT,
  tier TEXT,
  suggestion TEXT NOT NULL,

  -- Mico's evaluation (first filter)
  mico_evaluation JSONB,

  -- Claude's decision (final approval)
  claude_decision JSONB,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent_to_claude',
    'discarded_by_mico',
    'rejected_by_claude',
    'implementing',
    'pr_created',
    'implemented',
    'implementation_failed'
  )),

  -- GitHub PR info
  pr_url TEXT,
  pr_number INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  implemented_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own suggestions
CREATE POLICY suggestions_user_select ON suggestions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own suggestions
CREATE POLICY suggestions_user_insert ON suggestions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Service role can do everything
CREATE POLICY suggestions_service_all ON suggestions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE suggestions IS 'User feature suggestions - filtered by Mico, approved by Claude, implemented autonomously';
COMMENT ON COLUMN suggestions.mico_evaluation IS 'Mico AI first-pass evaluation (worthwhile or not)';
COMMENT ON COLUMN suggestions.claude_decision IS 'Claude final decision and implementation plan';
