-- 🔐 SECURE OWNER/ADMIN ACCESS SETUP
-- Run this in your Supabase SQL Editor
-- This adds proper role-based access control to your platform
-- Add role and admin columns to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
-- Set YOUR email as owner
UPDATE users
SET role = 'owner',
  is_admin = true
WHERE email = 'polotuspossumus@gmail.com';
-- Create Row Level Security (RLS) policies for owner access
-- Only owners can see all users
CREATE POLICY "Owners can view all users" ON users FOR
SELECT USING (
    role = 'owner'
    OR id = auth.uid() -- Users can see their own profile
  );
-- Only owners can update any user
CREATE POLICY "Owners can update any user" ON users FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND role = 'owner'
    )
  );
-- Users can only update their own profile (except role/admin fields)
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (id = auth.uid()) WITH CHECK (
    id = auth.uid()
    AND role = (
      SELECT role
      FROM users
      WHERE id = auth.uid()
    )
    AND -- Can't change own role
    is_admin = (
      SELECT is_admin
      FROM users
      WHERE id = auth.uid()
    ) -- Can't change own admin status
  );
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Create admin_logs table to track admin actions
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Only owners/admins can view admin logs
CREATE POLICY "Admins can view logs" ON admin_logs FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
        AND (
          role = 'owner'
          OR is_admin = true
        )
    )
  );
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
-- Grant necessary permissions
GRANT SELECT,
  INSERT,
  UPDATE ON users TO authenticated;
GRANT SELECT,
  INSERT ON admin_logs TO authenticated;
-- Success message
DO $$ BEGIN RAISE NOTICE '✅ Owner/Admin security setup complete!';
RAISE NOTICE '🔐 Your email has been set as owner';
RAISE NOTICE '📋 RLS policies enabled for secure access';
END $$;