-- Migration 007: Policy Overrides
-- Runtime configuration for thresholds, caps, and priority lanes
-- Allows Mico to adjust governance parameters without redeploy

CREATE TABLE IF NOT EXISTS policy_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  override_key TEXT UNIQUE NOT NULL,
  override_type TEXT NOT NULL CHECK (override_type IN (
    'moderation_threshold',
    'rate_limit',
    'authority_level',
    'feature_toggle',
    'priority_lane'
  )),
  override_value JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  set_by TEXT DEFAULT 'mico',
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policy_overrides_key ON policy_overrides(override_key);
CREATE INDEX idx_policy_overrides_type ON policy_overrides(override_type);
CREATE INDEX idx_policy_overrides_active ON policy_overrides(active) WHERE active = true;
CREATE INDEX idx_policy_overrides_expires_at ON policy_overrides(expires_at) WHERE expires_at IS NOT NULL;

-- Priority lanes: special processing paths for critical content
CREATE TABLE IF NOT EXISTS priority_lanes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lane_name TEXT UNIQUE NOT NULL,
  priority_level INTEGER NOT NULL CHECK (priority_level >= 1 AND priority_level <= 10),
  conditions JSONB NOT NULL, -- Rules for content to enter this lane
  processing_rules JSONB NOT NULL, -- How content in this lane is processed
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_priority_lanes_active ON priority_lanes(active) WHERE active = true;
CREATE INDEX idx_priority_lanes_priority ON priority_lanes(priority_level DESC);

-- Insert default priority lanes
INSERT INTO priority_lanes (lane_name, priority_level, conditions, processing_rules) VALUES
  ('csam_detection', 10,
   '{"flag_types": ["csam"], "min_confidence": 0.3}'::jsonb,
   '{"auto_action": "remove", "human_review": false, "notify_ncmec": true}'::jsonb),
  ('violence_extreme', 8,
   '{"flag_types": ["violence"], "min_confidence": 0.9}'::jsonb,
   '{"auto_action": "hide", "human_review": true, "escalate_to": "admin"}'::jsonb),
  ('trusted_creator', 3,
   '{"creator_tier": "verified", "history_clean": true}'::jsonb,
   '{"auto_action": "none", "human_review": false, "fast_track": true}'::jsonb),
  ('new_user', 7,
   '{"account_age_hours": {"$lt": 24}}'::jsonb,
   '{"auto_action": "hide", "human_review": true, "stricter_thresholds": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Admin caps: limits on admin superpowers
CREATE TABLE IF NOT EXISTS admin_caps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  capability TEXT NOT NULL,
  max_per_hour INTEGER,
  max_per_day INTEGER,
  requires_justification BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_id, capability)
);

CREATE INDEX idx_admin_caps_admin_id ON admin_caps(admin_id);
CREATE INDEX idx_admin_caps_active ON admin_caps(active) WHERE active = true;

-- Insert default admin caps
-- This limits what even admins can do without oversight
INSERT INTO admin_caps (admin_id, capability, max_per_hour, max_per_day, requires_justification)
SELECT
  u.id,
  'bulk_delete_content',
  10,
  50,
  true
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'admin'
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE policy_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_lanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_caps ENABLE ROW LEVEL SECURITY;

-- Admins can manage all overrides
CREATE POLICY "Admins can manage policy overrides" ON policy_overrides
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can manage priority lanes" ON priority_lanes
  FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can view admin caps" ON admin_caps
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Service can read all (agents need access)
CREATE POLICY "Service can read policy overrides" ON policy_overrides
  FOR SELECT USING (true);

CREATE POLICY "Service can read priority lanes" ON priority_lanes
  FOR SELECT USING (true);

CREATE POLICY "Service can read admin caps" ON admin_caps
  FOR SELECT USING (true);
