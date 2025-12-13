/**
 * Analytics API Route
 * Dashboard analytics and metrics
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get User Analytics
 * GET /api/routes/analytics/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [postsCount, followersCount, uploadsCount] = await Promise.all([
            supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
            supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
            supabase.from('uploads').select('id', { count: 'exact', head: true }).eq('user_id', userId)
        ]);

        res.json({
            posts: postsCount.count || 0,
            followers: followersCount.count || 0,
            uploads: uploadsCount.count || 0
        });
    } catch (error) {
        console.error('Get user analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Platform Analytics
 * GET /api/routes/analytics/platform
 */
router.get('/platform', async (req, res) => {
    try {
        const [usersCount, postsCount, uploadsCount] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('posts').select('id', { count: 'exact', head: true }),
            supabase.from('uploads').select('id', { count: 'exact', head: true })
        ]);

        res.json({
            totalUsers: usersCount.count || 0,
            totalPosts: postsCount.count || 0,
            totalUploads: uploadsCount.count || 0
        });
    } catch (error) {
        console.error('Get platform analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
