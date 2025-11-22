const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Block User - Blocks all their creator accounts
 * POST /api/blocks/create
 *
 * Body: {
 *   blockerId: UUID,  // Person doing the blocking
 *   blockedId: UUID   // Person being blocked
 * }
 *
 * For $1000 members with 3 creator accounts, this blocks ALL 3 accounts
 */
router.post('/create', async (req, res) => {
    try {
        const { blockerId, blockedId } = req.body;

        if (!blockerId || !blockedId) {
            return res.status(400).json({ error: 'blockerId and blockedId required' });
        }

        if (blockerId === blockedId) {
            return res.status(400).json({ error: 'Cannot block yourself' });
        }

        // Get all creator accounts linked to the blocked user
        // Assuming $1000 members have a 'linked_accounts' field or we track in user_payment_info
        const { data: blockedUser } = await supabase
            .from('user_payment_info')
            .select('user_id')
            .eq('user_id', blockedId)
            .single();

        // Get all linked creator accounts (for $1000 tier members)
        // This assumes you have a way to link the 3 creator accounts
        // For now, we'll block the main account and check for linked accounts
        const linkedAccountIds = [blockedId]; // Start with main account

        // Check if user has linked creator accounts
        // You'll need to implement this based on how you track the 3 accounts
        // Example: const { data: linkedAccounts } = await supabase
        //     .from('linked_creator_accounts')
        //     .select('creator_account_id')
        //     .eq('main_user_id', blockedId);
        // linkedAccountIds.push(...linkedAccounts.map(a => a.creator_account_id));

        // Create block records for ALL accounts
        const blockRecords = linkedAccountIds.map(accountId => ({
            blocker_id: blockerId,
            blocked_id: accountId,
            blocked_at: new Date().toISOString(),
            reason: linkedAccountIds.length > 1
                ? 'Multi-account block (all creator accounts blocked)'
                : 'User blocked'
        }));

        const { data, error } = await supabase
            .from('blocks')
            .insert(blockRecords);

        if (error) {
            // Handle duplicate blocks gracefully
            if (error.code === '23505') {
                return res.status(400).json({ error: 'User already blocked' });
            }
            throw error;
        }

        res.json({
            success: true,
            message: linkedAccountIds.length > 1
                ? `Blocked user and ${linkedAccountIds.length - 1} linked creator accounts`
                : 'User blocked',
            accountsBlocked: linkedAccountIds.length
        });

    } catch (error) {
        console.error('Block creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Unblock User - Unblocks all their creator accounts
 * DELETE /api/blocks/remove
 */
router.delete('/remove', async (req, res) => {
    try {
        const { blockerId, blockedId } = req.body;

        if (!blockerId || !blockedId) {
            return res.status(400).json({ error: 'blockerId and blockedId required' });
        }

        // Get all linked accounts
        const linkedAccountIds = [blockedId];
        // Add logic to get linked creator accounts here

        // Remove all block records
        const { error } = await supabase
            .from('blocks')
            .delete()
            .eq('blocker_id', blockerId)
            .in('blocked_id', linkedAccountIds);

        if (error) throw error;

        res.json({
            success: true,
            message: 'User unblocked',
            accountsUnblocked: linkedAccountIds.length
        });

    } catch (error) {
        console.error('Block removal error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check if User is Blocked
 * GET /api/blocks/check/:blockerId/:blockedId
 */
router.get('/check/:blockerId/:blockedId', async (req, res) => {
    try {
        const { blockerId, blockedId } = req.params;

        // Check if main account or any linked account is blocked
        const linkedAccountIds = [blockedId];
        // Add logic to get linked creator accounts here

        const { data: blocks } = await supabase
            .from('blocks')
            .select('*')
            .eq('blocker_id', blockerId)
            .in('blocked_id', linkedAccountIds);

        res.json({
            isBlocked: blocks && blocks.length > 0,
            blockedAccounts: blocks?.length || 0
        });

    } catch (error) {
        console.error('Block check error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get User's Block List
 * GET /api/blocks/list/:userId
 */
router.get('/list/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: blocks, error } = await supabase
            .from('blocks')
            .select('blocked_id, blocked_at, reason')
            .eq('blocker_id', userId)
            .order('blocked_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            blocks: blocks || [],
            totalBlocked: blocks?.length || 0
        });

    } catch (error) {
        console.error('Block list error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
