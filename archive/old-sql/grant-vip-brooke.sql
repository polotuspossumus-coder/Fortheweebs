-- Grant VIP Access to brookewhitley530@gmail.com
-- Run this in your Supabase SQL Editor

-- Update user to LIFETIME_VIP tier if they already exist
UPDATE users
SET
  tier = 'LIFETIME_VIP',
  "isOwner" = false
WHERE email = 'brookewhitley530@gmail.com';

-- If user doesn't exist yet, create them with VIP access
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (
  gen_random_uuid(),
  'brookewhitley530@gmail.com',
  'brookewhitley530',
  'Brooke Whitley',
  'LIFETIME_VIP',
  0,
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET tier = 'LIFETIME_VIP';

-- Verify the change
SELECT id, email, display_name, tier, created_at
FROM users
WHERE email = 'brookewhitley530@gmail.com';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ VIP access granted to brookewhitley530@gmail.com';
  RAISE NOTICE '👑 User can now access all LIFETIME_VIP features';
END $$;
