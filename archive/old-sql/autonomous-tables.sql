/**
 * DATABASE TABLES FOR AUTONOMOUS SYSTEMS
 * Run this in Supabase SQL Editor
 */

-- AI Conversations (for chat logs)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  tier TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source TEXT DEFAULT 'claude', -- 'mico' or 'claude'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON public.ai_conversations(created_at);

-- Suggestions table (already exists in database_autonomous_system.sql, but adding here for completeness)
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  tier TEXT,
  suggestion TEXT NOT NULL,
  status TEXT DEFAULT 'evaluating', -- 'evaluating', 'approved_implementing', 'rejected', 'implemented_pr_created', 'implementation_failed'
  ai_evaluation JSONB,
  ai_implementation JSONB,
  pr_url TEXT,
  pr_number INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  implemented_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_suggestions_user_id ON public.suggestions(user_id);
CREATE INDEX idx_suggestions_status ON public.suggestions(status);
CREATE INDEX idx_suggestions_created_at ON public.suggestions(created_at);

-- Bug reports table (update with new fields if already exists)
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bug_reports' AND column_name = 'routed_to_claude') THEN
    ALTER TABLE public.bug_reports ADD COLUMN routed_to_claude BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bug_reports' AND column_name = 'claude_analysis') THEN
    ALTER TABLE public.bug_reports ADD COLUMN claude_analysis JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bug_reports' AND column_name = 'pr_url') THEN
    ALTER TABLE public.bug_reports ADD COLUMN pr_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bug_reports' AND column_name = 'pr_number') THEN
    ALTER TABLE public.bug_reports ADD COLUMN pr_number INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bug_reports' AND column_name = 'fixed_at') THEN
    ALTER TABLE public.bug_reports ADD COLUMN fixed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Claude notifications table (for owner dashboard)
CREATE TABLE IF NOT EXISTS public.claude_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'bug_report', 'suggestion', 'system'
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'unread', -- 'unread', 'read', 'actioned'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  actioned_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_claude_notifications_status ON public.claude_notifications(status);
CREATE INDEX idx_claude_notifications_created_at ON public.claude_notifications(created_at);
CREATE INDEX idx_claude_notifications_type ON public.claude_notifications(type);

-- Enable Row Level Security
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claude_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for suggestions
CREATE POLICY "Users can view their own suggestions"
  ON public.suggestions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions"
  ON public.suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update suggestions"
  ON public.suggestions
  FOR UPDATE
  USING (true); -- Allow system updates from backend

-- RLS Policies for claude_notifications (owner only)
CREATE POLICY "Only owner can view notifications"
  ON public.claude_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'owner@fortheweebs.com' -- Replace with your email
    )
  );

CREATE POLICY "System can insert notifications"
  ON public.claude_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owner can update notifications"
  ON public.claude_notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'owner@fortheweebs.com' -- Replace with your email
    )
  );

-- Grant permissions
GRANT ALL ON public.ai_conversations TO authenticated;
GRANT ALL ON public.suggestions TO authenticated;
GRANT ALL ON public.claude_notifications TO authenticated;
GRANT ALL ON public.ai_conversations TO anon;
GRANT ALL ON public.suggestions TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Autonomous AI tables created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - ai_conversations (chat logs)';
  RAISE NOTICE '  - suggestions (feature requests + auto-implementation)';
  RAISE NOTICE '  - claude_notifications (owner dashboard)';
  RAISE NOTICE '  - bug_reports (updated with new fields)';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 Your autonomous AI system is ready!';
END $$;
