-- Grant VIP Access to ALL VIP Users
-- Run this in your Supabase SQL Editor

-- VIP User 1: Atolbert66@gmail.com
UPDATE users 
SET tier = 'LIFETIME_VIP', "isOwner" = false
WHERE email = 'Atolbert66@gmail.com';

INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (
  gen_random_uuid(),
  'Atolbert66@gmail.com',
  'atolbert66',
  'Atolbert',
  'LIFETIME_VIP',
  0,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 2: brookewhitley530@gmail.com
UPDATE users 
SET tier = 'LIFETIME_VIP', "isOwner" = false
WHERE email = 'brookewhitley530@gmail.com';

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
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- Verify all VIP users
SELECT id, email, display_name, tier, created_at
FROM users
WHERE email IN ('Atolbert66@gmail.com', 'brookewhitley530@gmail.com')
ORDER BY email;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ VIP access granted to all VIP users:';
  RAISE NOTICE '   - Atolbert66@gmail.com';
  RAISE NOTICE '   - brookewhitley530@gmail.com';
  RAISE NOTICE '👑 All users now have LIFETIME_VIP tier';
END $$;
