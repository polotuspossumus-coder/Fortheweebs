/**
 * Relationships API Route
 * Handles friends and follows
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get User Followers
 * GET /api/routes/relationships/followers/:userId
 */
router.get('/followers/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('follows')
            .select('follower:users!follower_id(id, username, avatar)')
            .eq('following_id', userId);

        if (error) throw error;

        res.json({ followers: data || [] });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get User Following
 * GET /api/routes/relationships/following/:userId
 */
router.get('/following/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('follows')
            .select('following:users!following_id(id, username, avatar)')
            .eq('follower_id', userId);

        if (error) throw error;

        res.json({ following: data || [] });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Follow User
 * POST /api/routes/relationships/follow
 */
router.post('/follow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('follows')
            .insert({
                follower_id: followerId,
                following_id: followingId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ follow: data });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Unfollow User
 * POST /api/routes/relationships/unfollow
 */
router.post('/unfollow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
