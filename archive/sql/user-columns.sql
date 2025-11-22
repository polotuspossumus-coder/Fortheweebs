-- ===============================================
-- ADD USER COLUMNS (Run this separately if you have superuser access)
-- If this fails with permission errors, you need to add these columns
-- through Supabase Dashboard > Authentication > Users > Add column
-- ===============================================

-- Add these 8 columns to auth.users table:

ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT UNIQUE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'not_created';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS payment_enabled BOOLEAN DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS influencer_free BOOLEAN DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS verified_platform TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS verified_username TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS verified_followers INTEGER;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
