-- ===============================================
-- USER PAYMENT INFO TABLE
-- Alternative to modifying auth.users (which is protected)
-- Run this in Supabase SQL Editor
-- ===============================================

-- Create user payment info table (replaces the 8 columns we couldn't add to auth.users)
CREATE TABLE IF NOT EXISTS public.user_payment_info (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe Connect fields (for creators receiving payments)
  stripe_connect_id TEXT UNIQUE,
  stripe_connect_status TEXT DEFAULT 'not_created' CHECK (stripe_connect_status IN ('not_created', 'pending', 'active')),
  payment_enabled BOOLEAN DEFAULT false,

  -- Influencer verification fields
  influencer_free BOOLEAN DEFAULT false,
  verified_platform TEXT,
  verified_username TEXT,
  verified_followers INTEGER,

  -- Stripe customer field (for users making payments)
  stripe_customer_id TEXT UNIQUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_payment_info_stripe_connect ON public.user_payment_info(stripe_connect_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_info_stripe_customer ON public.user_payment_info(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_info_influencer ON public.user_payment_info(influencer_free) WHERE influencer_free = true;

-- Enable RLS
ALTER TABLE public.user_payment_info ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
DROP POLICY IF EXISTS service_all_user_payment_info ON public.user_payment_info;
CREATE POLICY service_all_user_payment_info ON public.user_payment_info FOR ALL USING (true);

-- Users can read their own payment info
DROP POLICY IF EXISTS users_read_own_payment_info ON public.user_payment_info;
CREATE POLICY users_read_own_payment_info ON public.user_payment_info FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own payment info
DROP POLICY IF EXISTS users_update_own_payment_info ON public.user_payment_info;
CREATE POLICY users_update_own_payment_info ON public.user_payment_info FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_payment_info IS 'User payment and verification info (Stripe Connect, influencer status)';

-- Auto-create record when user signs up (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user_payment_info()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_payment_info (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create payment info for new users
DROP TRIGGER IF EXISTS on_auth_user_created_payment_info ON auth.users;
CREATE TRIGGER on_auth_user_created_payment_info
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_payment_info();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ user_payment_info table created!';
  RAISE NOTICE '✅ Auto-creates record for new users';
  RAISE NOTICE '✅ Contains all 8 payment fields';
  RAISE NOTICE '🎉 Payment system setup complete!';
END $$;
