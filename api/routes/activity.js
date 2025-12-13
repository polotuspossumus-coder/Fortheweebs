/**
 * Activity Feed API Route
 * Real-time activity feed
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get Activity Feed
 * GET /api/routes/activity/:userId
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const offset = (page - 1) * limit;

        const { data, error } = await supabase
            .from('activity_feed')
            .select('*, actor:users(id, username, avatar)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({ activities: data || [], page: parseInt(page) });
    } catch (error) {
        console.error('Get activity feed error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Activity
 * POST /api/routes/activity
 */
router.post('/', async (req, res) => {
    try {
        const { userId, actorId, type, content, targetId } = req.body;

        if (!userId || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('activity_feed')
            .insert({
                user_id: userId,
                actor_id: actorId,
                type: type,
                content: content,
                target_id: targetId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ activity: data });
    } catch (error) {
        console.error('Create activity error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
