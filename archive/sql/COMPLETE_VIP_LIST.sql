-- ========================================
-- COMPLETE VIP ACCESS FOR ALL 11 USERS
-- Run this in Supabase SQL Editor
-- ========================================

-- VIP User 1: chesed04@aol.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'chesed04@aol.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'chesed04@aol.com', 'chesed04', 'Chesed', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 2: Colbyg123f@gmail.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'Colbyg123f@gmail.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'Colbyg123f@gmail.com', 'colbyg123f', 'Colby', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 3: PerryMorr94@gmail.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'PerryMorr94@gmail.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'PerryMorr94@gmail.com', 'perrymorr94', 'Perry', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 4: remyvogt@gmail.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'remyvogt@gmail.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'remyvogt@gmail.com', 'remyvogt', 'Remy', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 5: kh@savantenergy.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'kh@savantenergy.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'kh@savantenergy.com', 'kh_savant', 'KH', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 6: Bleska@mindspring.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'Bleska@mindspring.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'Bleska@mindspring.com', 'bleska', 'Bleska', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 7: palmlana@yahoo.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'palmlana@yahoo.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'palmlana@yahoo.com', 'palmlana', 'Palmlana', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 8: Billyxfitzgerald@yahoo.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'Billyxfitzgerald@yahoo.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'Billyxfitzgerald@yahoo.com', 'billyxfitzgerald', 'Billy', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 9: Yeahitsmeangel@yahoo.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'Yeahitsmeangel@yahoo.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'Yeahitsmeangel@yahoo.com', 'yeahitsmeangel', 'Angel', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 10: Atolbert66@gmail.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'Atolbert66@gmail.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'Atolbert66@gmail.com', 'atolbert66', 'Atolbert', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- VIP User 11: brookewhitley530@gmail.com
UPDATE users SET tier = 'LIFETIME_VIP' WHERE email = 'brookewhitley530@gmail.com';
INSERT INTO users (id, email, username, display_name, tier, balance, created_at)
VALUES (gen_random_uuid(), 'brookewhitley530@gmail.com', 'brookewhitley530', 'Brooke Whitley', 'LIFETIME_VIP', 0, NOW())
ON CONFLICT (email) DO UPDATE SET tier = 'LIFETIME_VIP';

-- ========================================
-- VERIFY ALL VIP USERS
-- ========================================
SELECT id, email, display_name, tier, created_at
FROM users
WHERE email IN (
  'chesed04@aol.com',
  'Colbyg123f@gmail.com',
  'PerryMorr94@gmail.com',
  'remyvogt@gmail.com',
  'kh@savantenergy.com',
  'Bleska@mindspring.com',
  'palmlana@yahoo.com',
  'Billyxfitzgerald@yahoo.com',
  'Yeahitsmeangel@yahoo.com',
  'Atolbert66@gmail.com',
  'brookewhitley530@gmail.com'
)
ORDER BY email;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ VIP ACCESS GRANTED TO ALL 11 USERS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'VIP Users:';
  RAISE NOTICE '  1. chesed04@aol.com';
  RAISE NOTICE '  2. Colbyg123f@gmail.com';
  RAISE NOTICE '  3. PerryMorr94@gmail.com';
  RAISE NOTICE '  4. remyvogt@gmail.com';
  RAISE NOTICE '  5. kh@savantenergy.com';
  RAISE NOTICE '  6. Bleska@mindspring.com';
  RAISE NOTICE '  7. palmlana@yahoo.com';
  RAISE NOTICE '  8. Billyxfitzgerald@yahoo.com';
  RAISE NOTICE '  9. Yeahitsmeangel@yahoo.com';
  RAISE NOTICE ' 10. Atolbert66@gmail.com';
  RAISE NOTICE ' 11. brookewhitley530@gmail.com';
  RAISE NOTICE '';
  RAISE NOTICE '👑 All users now have LIFETIME_VIP tier!';
  RAISE NOTICE '========================================';
END $$;
