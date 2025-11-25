-- Migration 006: Governance Notary
-- Tracks every override, escalation, and special decision made by Mico
-- Provides immutable authority trail

CREATE TABLE IF NOT EXISTS governance_notary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'threshold_override',
    'policy_escalation',
    'emergency_action',
    'authority_grant',
    'authority_revoke',
    'guard_mode_toggle',
    'manual_review'
  )),
  entity_type TEXT,
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  justification TEXT NOT NULL,
  authorized_by TEXT DEFAULT 'mico' NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_governance_notary_timestamp ON governance_notary(timestamp DESC);
CREATE INDEX idx_governance_notary_action_type ON governance_notary(action_type);
CREATE INDEX idx_governance_notary_entity ON governance_notary(entity_type, entity_id);
CREATE INDEX idx_governance_notary_authorized_by ON governance_notary(authorized_by);

-- Row Level Security
ALTER TABLE governance_notary ENABLE ROW LEVEL SECURITY;

-- Admins can view all governance records
CREATE POLICY "Admins can view all governance notary records" ON governance_notary
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Service role can insert (Mico uses service key)
CREATE POLICY "Service can insert governance notary records" ON governance_notary
  FOR INSERT WITH CHECK (true);

-- No updates or deletes - immutable record
