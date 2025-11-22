-- ===============================================
-- FORTHEWEEBS - COMPLETE PAYMENT SYSTEM SCHEMA
-- Run this in Supabase SQL Editor
-- ===============================================

-- Fix remaining 5 RLS errors
ALTER TABLE public.user_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_watermarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dmca_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dmca_counter_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (drop first if they exist)
DROP POLICY IF EXISTS service_all_user_strikes ON public.user_strikes;
DROP POLICY IF EXISTS service_all_watermarks ON public.content_watermarks;
DROP POLICY IF EXISTS service_all_dmca ON public.dmca_requests;
DROP POLICY IF EXISTS service_all_dmca_counter ON public.dmca_counter_notifications;
DROP POLICY IF EXISTS service_all_user_bans ON public.user_bans;

CREATE POLICY service_all_user_strikes ON public.user_strikes FOR ALL USING (true);
CREATE POLICY service_all_watermarks ON public.content_watermarks FOR ALL USING (true);
CREATE POLICY service_all_dmca ON public.dmca_requests FOR ALL USING (true);
CREATE POLICY service_all_dmca_counter ON public.dmca_counter_notifications FOR ALL USING (true);
CREATE POLICY service_all_user_bans ON public.user_bans FOR ALL USING (true);

-- Subscription tables for Stripe integration
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'sovereign')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_subscriptions ON public.subscriptions FOR ALL USING (true);
CREATE POLICY users_read_own_subscription ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Tier unlocks for sovereign purchases ($50+)
CREATE TABLE IF NOT EXISTS public.tier_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  tier_amount INTEGER NOT NULL CHECK (tier_amount >= 5000), -- $50.00 minimum
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, tier_name)
);

CREATE INDEX idx_tier_unlocks_user_id ON public.tier_unlocks(user_id);
CREATE INDEX idx_tier_unlocks_tier_amount ON public.tier_unlocks(tier_amount DESC);

ALTER TABLE public.tier_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_tier_unlocks ON public.tier_unlocks FOR ALL USING (true);
CREATE POLICY users_read_own_unlocks ON public.tier_unlocks FOR SELECT USING (auth.uid() = user_id);

-- Monetized content access tracking
CREATE TABLE IF NOT EXISTS public.monetized_content_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  access_price INTEGER NOT NULL, -- in cents
  stripe_payment_intent_id TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX idx_monetized_access_user_id ON public.monetized_content_access(user_id);
CREATE INDEX idx_monetized_access_content ON public.monetized_content_access(content_id);

ALTER TABLE public.monetized_content_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_monetized_access ON public.monetized_content_access FOR ALL USING (true);
CREATE POLICY users_read_own_access ON public.monetized_content_access FOR SELECT USING (auth.uid() = user_id);

-- Tips table for creator tipping
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipper_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 1.00),
  platform_fee NUMERIC(10,2) DEFAULT 0,
  creator_receives NUMERIC(10,2) NOT NULL,
  message TEXT,
  payment_intent_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tips_creator_id ON public.tips(creator_id);
CREATE INDEX idx_tips_tipper_id ON public.tips(tipper_id);
CREATE INDEX idx_tips_created_at ON public.tips(created_at DESC);

ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_tips ON public.tips FOR ALL USING (true);
CREATE POLICY users_read_own_tips ON public.tips FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = tipper_id);

-- Creator subscriptions (Patreon-style)
CREATE TABLE IF NOT EXISTS public.creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  price_per_month NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) DEFAULT 0,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_creator_subs_creator ON public.creator_subscriptions(creator_id);
CREATE INDEX idx_creator_subs_subscriber ON public.creator_subscriptions(subscriber_id);
CREATE INDEX idx_creator_subs_status ON public.creator_subscriptions(status);

ALTER TABLE public.creator_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_creator_subs ON public.creator_subscriptions FOR ALL USING (true);
CREATE POLICY users_read_own_creator_subs ON public.creator_subscriptions FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = subscriber_id);

-- Commissions table for paid work
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'paid', 'cancelled')),
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_commissions_creator ON public.commissions(creator_id);
CREATE INDEX idx_commissions_buyer ON public.commissions(buyer_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_commissions ON public.commissions FOR ALL USING (true);
CREATE POLICY users_read_own_commissions ON public.commissions FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = buyer_id);

-- Crypto payments table
CREATE TABLE IF NOT EXISTS public.crypto_payments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('subscription', 'tip', 'commission', 'unlock')),
  amount_usd NUMERIC(10,2) NOT NULL,
  crypto_type TEXT NOT NULL CHECK (crypto_type IN ('bitcoin', 'ethereum')),
  crypto_amount NUMERIC(18,8) NOT NULL,
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_confirmation', 'confirmed', 'expired', 'failed')),
  tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID
);

CREATE INDEX idx_crypto_payments_user ON public.crypto_payments(user_id);
CREATE INDEX idx_crypto_payments_status ON public.crypto_payments(status);
CREATE INDEX idx_crypto_payments_tx_hash ON public.crypto_payments(tx_hash);

ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_crypto_payments ON public.crypto_payments FOR ALL USING (true);
CREATE POLICY users_read_own_crypto_payments ON public.crypto_payments FOR SELECT USING (auth.uid() = user_id);

-- Add new columns to users table if they don't exist
DO $$
BEGIN
  -- Stripe Connect columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_connect_id') THEN
    ALTER TABLE auth.users ADD COLUMN stripe_connect_id TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_connect_status') THEN
    ALTER TABLE auth.users ADD COLUMN stripe_connect_status TEXT DEFAULT 'not_created' CHECK (stripe_connect_status IN ('not_created', 'pending', 'active'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'payment_enabled') THEN
    ALTER TABLE auth.users ADD COLUMN payment_enabled BOOLEAN DEFAULT false;
  END IF;

  -- Influencer verification columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'influencer_free') THEN
    ALTER TABLE auth.users ADD COLUMN influencer_free BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verified_platform') THEN
    ALTER TABLE auth.users ADD COLUMN verified_platform TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verified_username') THEN
    ALTER TABLE auth.users ADD COLUMN verified_username TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verified_followers') THEN
    ALTER TABLE auth.users ADD COLUMN verified_followers INTEGER;
  END IF;

  -- Stripe customer column for subscriptions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE auth.users ADD COLUMN stripe_customer_id TEXT UNIQUE;
  END IF;
END $$;

COMMENT ON TABLE public.subscriptions IS 'Platform subscriptions ($15/month Adult Access)';
COMMENT ON TABLE public.tier_unlocks IS 'One-time tier unlocks ($50-$1000 sovereign tiers)';
COMMENT ON TABLE public.monetized_content_access IS 'Pay-per-view content purchases';
COMMENT ON TABLE public.tips IS 'Direct tips to creators (0-15% platform fee)';
COMMENT ON TABLE public.creator_subscriptions IS 'Patreon-style creator subscriptions';
COMMENT ON TABLE public.commissions IS 'Commission work tracking and payments';
COMMENT ON TABLE public.crypto_payments IS 'Bitcoin and Ethereum payment tracking';