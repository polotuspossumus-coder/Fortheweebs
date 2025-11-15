-- ForTheWeebs Platform Database Schema - CLEAN INSTALL
-- This will drop all existing tables and recreate them
-- ============================================
-- DROP EXISTING TABLES (if any)
-- ============================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS tips CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS commission_orders CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'free' CHECK (
    tier IN ('free', 'bronze', 'silver', 'gold', 'platinum')
  ),
  balance DECIMAL(10, 2) DEFAULT 0.00,
  subscription_status TEXT DEFAULT 'inactive' CHECK (
    subscription_status IN ('active', 'inactive', 'canceled', 'past_due')
  ),
  is_creator BOOLEAN DEFAULT false,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
-- ============================================
-- ARTWORKS TABLE
-- ============================================
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT [] DEFAULT '{}',
  nsfw BOOLEAN DEFAULT false,
  nsfw_score DECIMAL(3, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'published' CHECK (
    status IN ('published', 'draft', 'flagged', 'removed')
  ),
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_artworks_creator ON artworks(creator_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_nsfw ON artworks(nsfw);
CREATE INDEX idx_artworks_created ON artworks(created_at DESC);
-- ============================================
-- COMMISSIONS TABLE
-- ============================================
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  delivery_time TEXT,
  is_open BOOLEAN DEFAULT true,
  examples JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_commissions_creator ON commissions(creator_id);
CREATE INDEX idx_commissions_open ON commissions(is_open);
-- ============================================
-- COMMISSION ORDERS TABLE
-- ============================================
CREATE TABLE commission_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  creator_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'in_progress',
      'completed',
      'canceled'
    )
  ),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_intent_id TEXT,
  requirements TEXT,
  delivery_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_commission_orders_buyer ON commission_orders(buyer_id);
CREATE INDEX idx_commission_orders_creator ON commission_orders(creator_id);
CREATE INDEX idx_commission_orders_status ON commission_orders(status);
-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  status TEXT NOT NULL CHECK (
    status IN ('active', 'canceled', 'past_due', 'incomplete')
  ),
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
-- ============================================
-- TIPS TABLE
-- ============================================
CREATE TABLE tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  payment_intent_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_tips_sender ON tips(sender_id);
CREATE INDEX idx_tips_creator ON tips(creator_id);
CREATE INDEX idx_tips_created ON tips(created_at DESC);
-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (
    type IN ('tip', 'commission', 'subscription_payment')
  ),
  payment_intent_id TEXT,
  invoice_id TEXT,
  subscription_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'pending')),
  creator_id UUID REFERENCES users(id) ON DELETE
  SET NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE
  SET NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transactions_creator ON transactions(creator_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_comments_artwork ON comments(artwork_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
-- ============================================
-- LIKES TABLE
-- ============================================
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(artwork_id, user_id)
);
CREATE INDEX idx_likes_artwork ON likes(artwork_id);
CREATE INDEX idx_likes_user ON likes(user_id);
-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN (
      'like',
      'comment',
      'follow',
      'tip',
      'commission',
      'system'
    )
  ),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ============================================
-- RLS POLICIES
-- ============================================
CREATE POLICY "Users can view all profiles" ON users FOR
SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view published artworks" ON artworks FOR
SELECT USING (status = 'published');
CREATE POLICY "Creators can insert own artworks" ON artworks FOR
INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own artworks" ON artworks FOR
UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own artworks" ON artworks FOR DELETE USING (auth.uid() = creator_id);
CREATE POLICY "Anyone can view commissions" ON commissions FOR
SELECT USING (true);
CREATE POLICY "Creators can insert own commissions" ON commissions FOR
INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own commissions" ON commissions FOR
UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own commissions" ON commissions FOR DELETE USING (auth.uid() = creator_id);
CREATE POLICY "Users can view own orders" ON commission_orders FOR
SELECT USING (
    auth.uid() = buyer_id
    OR auth.uid() = creator_id
  );
CREATE POLICY "Anyone can insert orders" ON commission_orders FOR
INSERT WITH CHECK (true);
CREATE POLICY "Creators can update orders" ON commission_orders FOR
UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view sent/received tips" ON tips FOR
SELECT USING (
    auth.uid() = sender_id
    OR auth.uid() = creator_id
  );
CREATE POLICY "Anyone can insert tips" ON tips FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can view own transactions" ON transactions FOR
SELECT USING (
    auth.uid() = creator_id
    OR auth.uid() = buyer_id
  );
CREATE POLICY "Anyone can view comments" ON comments FOR
SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON comments FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view likes" ON likes FOR
SELECT USING (true);
CREATE POLICY "Authenticated users can insert likes" ON likes FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view follows" ON follows FOR
SELECT USING (true);
CREATE POLICY "Authenticated users can insert follows" ON follows FOR
INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON follows FOR DELETE USING (auth.uid() = follower_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert notifications" ON notifications FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR
UPDATE USING (auth.uid() = user_id);