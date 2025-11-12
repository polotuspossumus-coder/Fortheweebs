-- ForTheWeebs Database Schema (Supabase PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  payment_tier TEXT DEFAULT 'FREE',
  tier_updated_at TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'none',
  stripe_session_id TEXT,
  amount_paid DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment sessions table
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES users(id),
  tier TEXT NOT NULL,
  amount_usd DECIMAL(10, 2) NOT NULL,
  display_currency TEXT,
  display_amount DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Failed tier updates (for manual review)
CREATE TABLE IF NOT EXISTS failed_tier_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  tier TEXT,
  session_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Failed payments log
CREATE TABLE IF NOT EXISTS failed_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_intent_id TEXT,
  session_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bug reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id BIGINT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  description TEXT NOT NULL,
  screenshot TEXT,
  browser_info JSONB,
  steps TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  severity TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bug analyses (AI screenshot analysis)
CREATE TABLE IF NOT EXISTS bug_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_report_id BIGINT REFERENCES bug_reports(id),
  screenshot_hash TEXT,
  description TEXT,
  analysis JSONB,
  browser_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bug fixes (AI generated fixes)
CREATE TABLE IF NOT EXISTS bug_fixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_report_id BIGINT REFERENCES bug_reports(id),
  analysis_id UUID REFERENCES bug_analyses(id),
  fix JSONB NOT NULL,
  status TEXT DEFAULT 'generated',
  pr_number INTEGER,
  pr_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id),
  preferred_language TEXT DEFAULT 'en',
  preferred_currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX idx_users_payment_tier ON users(payment_tier);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_payment_sessions_user_id ON payment_sessions(user_id);
CREATE INDEX idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX idx_bug_reports_status ON bug_reports(status);
CREATE INDEX idx_bug_fixes_bug_report_id ON bug_fixes(bug_report_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can read their own payment sessions
CREATE POLICY payment_sessions_select_own ON payment_sessions
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can read their own bug reports
CREATE POLICY bug_reports_select_own ON bug_reports
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can create bug reports
CREATE POLICY bug_reports_insert_own ON bug_reports
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can read their own preferences
CREATE POLICY user_preferences_select_own ON user_preferences
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own preferences
CREATE POLICY user_preferences_update_own ON user_preferences
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role can do everything (for API)
CREATE POLICY service_role_all ON users
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY service_role_all_payments ON payment_sessions
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY service_role_all_bugs ON bug_reports
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_sessions_updated_at
  BEFORE UPDATE ON payment_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bug_fixes_updated_at
  BEFORE UPDATE ON bug_fixes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default owner user (for testing)
INSERT INTO users (id, email, username, payment_tier, payment_status, created_at)
VALUES ('owner', 'owner@fortheweebs.com', 'polotus', 'SUPER_ADMIN', 'owner', NOW())
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;
