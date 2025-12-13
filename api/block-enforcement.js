/**
 * Block Enforcement API
 * Handles user blocking and content filtering
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Block User
 * POST /api/block-enforcement/block
 */
router.post('/block', async (req, res) => {
    try {
        const { userId, blockedUserId } = req.body;

        if (!userId || !blockedUserId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('user_blocks')
            .insert({
                user_id: userId,
                blocked_user_id: blockedUserId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ block: data });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Unblock User
 * POST /api/block-enforcement/unblock
 */
router.post('/unblock', async (req, res) => {
    try {
        const { userId, blockedUserId } = req.body;

        if (!userId || !blockedUserId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { error } = await supabase
            .from('user_blocks')
            .delete()
            .eq('user_id', userId)
            .eq('blocked_user_id', blockedUserId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Blocked Users
 * GET /api/block-enforcement/blocked/:userId
 */
router.get('/blocked/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('user_blocks')
            .select('blocked_user:users!blocked_user_id(id, username, avatar)')
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ blocked: data || [] });
    } catch (error) {
        console.error('Get blocked users error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check if User is Blocked
 * GET /api/block-enforcement/is-blocked/:userId/:targetUserId
 */
router.get('/is-blocked/:userId/:targetUserId', async (req, res) => {
    try {
        const { userId, targetUserId } = req.params;

        const { data, error } = await supabase
            .from('user_blocks')
            .select('id')
            .eq('user_id', userId)
            .eq('blocked_user_id', targetUserId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({ blocked: !!data });
    } catch (error) {
        console.error('Check blocked error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
