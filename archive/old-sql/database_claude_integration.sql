-- Database tables for Claude Code Integration
-- Bug reports route to Claude, Suggestions from Mico route to Claude

-- Suggestions Table (Mico evaluates, good ones go to Claude)
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT,
  tier TEXT,
  suggestion TEXT NOT NULL,
  mico_evaluation JSONB, -- Mico's verdict, reasoning, priority, category
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT CHECK (category IN ('ui', 'feature', 'performance', 'content', 'monetization', 'other')),
  status TEXT DEFAULT 'pending_claude_review' CHECK (status IN ('pending_claude_review', 'approved', 'implemented', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ
);

-- Claude Notifications Table (All reports/suggestions that need Claude's attention)
CREATE TABLE IF NOT EXISTS claude_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('bug_report', 'suggestion')),
  title TEXT NOT NULL,
  data JSONB NOT NULL, -- Contains all relevant info
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Update bug_reports table to include routing flag
ALTER TABLE bug_reports ADD COLUMN IF NOT EXISTS routed_to_claude BOOLEAN DEFAULT false;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_claude_notifications_status ON claude_notifications(status);
CREATE INDEX IF NOT EXISTS idx_claude_notifications_type ON claude_notifications(type);
CREATE INDEX IF NOT EXISTS idx_claude_notifications_created_at ON claude_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE claude_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own suggestions
CREATE POLICY suggestions_user_select ON suggestions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own suggestions
CREATE POLICY suggestions_user_insert ON suggestions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Only service role can update/delete
CREATE POLICY suggestions_service_all ON suggestions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policy: Only service role and owner can see Claude notifications
CREATE POLICY claude_notifications_owner_only ON claude_notifications
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role' OR auth.jwt()->>'email' = 'owner@email.com'); -- TODO: Replace with actual owner email

COMMENT ON TABLE suggestions IS 'User feature suggestions evaluated by Mico, good ones routed to Claude';
COMMENT ON TABLE claude_notifications IS 'All items requiring Claude attention (bug reports and suggestions)';
COMMENT ON COLUMN suggestions.mico_evaluation IS 'Mico AI evaluation including verdict, reasoning, and classification';
COMMENT ON COLUMN claude_notifications.data IS 'Full context for Claude to review and decide on action';
