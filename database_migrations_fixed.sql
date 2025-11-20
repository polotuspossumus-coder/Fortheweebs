-- ===================================
-- FORTHEWEEBS SECURITY SYSTEM MIGRATIONS (FIXED)
-- Run this in your Supabase SQL Editor
-- ===================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- DROP EXISTING TABLES IF THEY HAVE ERRORS
-- ===================================
DROP TABLE IF EXISTS user_devices CASCADE;

-- ===================================
-- FRAUD DETECTION TABLES
-- ===================================

-- Fraud analysis logs
CREATE TABLE IF NOT EXISTS fraud_analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  risk_factors JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_logs_user ON fraud_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_timestamp ON fraud_analysis_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_risk_level ON fraud_analysis_logs(risk_level);

-- Payment attempts (for velocity tracking)
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  card_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_user ON payment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_created ON payment_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_card ON payment_attempts(card_fingerprint);

-- Declined cards tracking
CREATE TABLE IF NOT EXISTS declined_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_fingerprint TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_declined_cards_fingerprint ON declined_cards(card_fingerprint);

-- Chargebacks
CREATE TABLE IF NOT EXISTS chargebacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chargebacks_user ON chargebacks(user_id);

-- ===================================
-- CONTENT MODERATION TABLES
-- ===================================

-- Piracy detection logs
CREATE TABLE IF NOT EXISTS piracy_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  is_blocked BOOLEAN NOT NULL,
  violations_count INTEGER NOT NULL,
  violations JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_piracy_logs_user ON piracy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_piracy_logs_blocked ON piracy_logs(is_blocked);
CREATE INDEX IF NOT EXISTS idx_piracy_logs_timestamp ON piracy_logs(timestamp);

-- Content moderation logs
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderation_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  is_approved BOOLEAN NOT NULL,
  requires_review BOOLEAN NOT NULL,
  violation_count INTEGER NOT NULL,
  violations JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_user ON moderation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_approved ON moderation_logs(is_approved);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_review ON moderation_logs(requires_review);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_timestamp ON moderation_logs(timestamp);

-- ===================================
-- ADMIN & ALERTS TABLES
-- ===================================

-- Admin alerts
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  user_id UUID,
  details JSONB,
  requires_action BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_resolved ON admin_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON admin_alerts(created_at);

-- ===================================
-- USER TRACKING TABLES
-- ===================================

-- User devices (for fraud detection) - RECREATED WITH CORRECT STRUCTURE
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  fingerprint TEXT NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON user_devices(fingerprint);

-- ===================================
-- UPDATE USERS TABLE (SAFE VERSION)
-- ===================================

-- Add new columns to users table if they don't exist
DO $$
BEGIN
    -- Chargeback tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='users' AND column_name='chargeback_count') THEN
        ALTER TABLE public.users ADD COLUMN chargeback_count INTEGER DEFAULT 0;
    END IF;

    -- Storage usage tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='users' AND column_name='storage_used') THEN
        ALTER TABLE public.users ADD COLUMN storage_used BIGINT DEFAULT 0;
    END IF;

    -- Feature usage tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='users' AND column_name='feature_usage') THEN
        ALTER TABLE public.users ADD COLUMN feature_usage JSONB DEFAULT '{}';
    END IF;

    -- Activity count (for fraud detection)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='users' AND column_name='activity_count') THEN
        ALTER TABLE public.users ADD COLUMN activity_count INTEGER DEFAULT 0;
    END IF;

    -- Last login tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='users' AND column_name='last_login') THEN
        ALTER TABLE public.users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ===================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================

-- Enable RLS on all tables
ALTER TABLE fraud_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE declined_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE chargebacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE piracy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Users can view their own devices
DROP POLICY IF EXISTS "Users can view own devices" ON user_devices;
CREATE POLICY "Users can view own devices" ON user_devices
  FOR SELECT USING (auth.uid() = user_id);

-- ===================================
-- FUNCTIONS
-- ===================================

-- Function to automatically clean up old logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM fraud_analysis_logs WHERE timestamp < NOW() - INTERVAL '90 days';
    DELETE FROM payment_attempts WHERE created_at < NOW() - INTERVAL '90 days';
    DELETE FROM piracy_logs WHERE timestamp < NOW() - INTERVAL '90 days';
    DELETE FROM moderation_logs WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- VERIFICATION
-- ===================================

-- Verify all tables were created
SELECT 'MIGRATION COMPLETE!' as status;

SELECT
    'fraud_analysis_logs' as table_name,
    COUNT(*) as row_count
FROM fraud_analysis_logs
UNION ALL
SELECT 'payment_attempts', COUNT(*) FROM payment_attempts
UNION ALL
SELECT 'declined_cards', COUNT(*) FROM declined_cards
UNION ALL
SELECT 'chargebacks', COUNT(*) FROM chargebacks
UNION ALL
SELECT 'piracy_logs', COUNT(*) FROM piracy_logs
UNION ALL
SELECT 'moderation_logs', COUNT(*) FROM moderation_logs
UNION ALL
SELECT 'admin_alerts', COUNT(*) FROM admin_alerts
UNION ALL
SELECT 'user_devices', COUNT(*) FROM user_devices;
