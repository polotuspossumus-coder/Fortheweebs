-- ===============================================
-- BLOCKS TABLE - Multi-Account Block Enforcement
-- Run this in Supabase SQL Editor
-- ===============================================

CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON public.blocks(blocked_id);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
DROP POLICY IF EXISTS service_all_blocks ON public.blocks;
CREATE POLICY service_all_blocks ON public.blocks FOR ALL USING (true);

-- Users can read their own blocks
DROP POLICY IF EXISTS users_read_own_blocks ON public.blocks;
CREATE POLICY users_read_own_blocks ON public.blocks FOR SELECT USING (auth.uid() = blocker_id);

-- Users can create blocks
DROP POLICY IF EXISTS users_create_blocks ON public.blocks;
CREATE POLICY users_create_blocks ON public.blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks
DROP POLICY IF EXISTS users_delete_blocks ON public.blocks;
CREATE POLICY users_delete_blocks ON public.blocks FOR DELETE USING (auth.uid() = blocker_id);

COMMENT ON TABLE public.blocks IS 'User blocks - blocks all creator accounts when one is blocked';

-- Linked Creator Accounts Table (for $1000 tier members with 3 accounts)
CREATE TABLE IF NOT EXISTS public.linked_creator_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_account_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number INTEGER CHECK (account_number BETWEEN 1 AND 3),
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(main_user_id, account_number),
  UNIQUE(creator_account_id)
);

CREATE INDEX IF NOT EXISTS idx_linked_accounts_main ON public.linked_creator_accounts(main_user_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_creator ON public.linked_creator_accounts(creator_account_id);

ALTER TABLE public.linked_creator_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_all_linked_accounts ON public.linked_creator_accounts;
CREATE POLICY service_all_linked_accounts ON public.linked_creator_accounts FOR ALL USING (true);

DROP POLICY IF EXISTS users_read_own_linked ON public.linked_creator_accounts;
CREATE POLICY users_read_own_linked ON public.linked_creator_accounts FOR SELECT USING (auth.uid() = main_user_id OR auth.uid() = creator_account_id);

COMMENT ON TABLE public.linked_creator_accounts IS '$1000 tier members can link up to 3 creator accounts';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Blocks table created!';
  RAISE NOTICE '✅ Linked creator accounts table created!';
  RAISE NOTICE '✅ Multi-account block enforcement ready!';
END $$;
