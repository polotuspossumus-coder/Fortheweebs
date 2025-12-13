/**
 * Notifications API Route
 * Handles user notifications
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get User Notifications
 * GET /api/routes/notifications/:userId
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { unreadOnly = false } = req.query;

        let query = supabase
            .from('notifications')
            .select('*, actor:users!actor_id(id, username, avatar)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (unreadOnly === 'true') {
            query = query.eq('read', false);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ notifications: data || [] });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Mark Notification as Read
 * POST /api/routes/notifications/:notificationId/read
 */
router.post('/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Mark All Notifications as Read
 * POST /api/routes/notifications/mark-all-read
 */
router.post('/mark-all-read', async (req, res) => {
    try {
        

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const { error } = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Notification
 * POST /api/routes/notifications
 */
router.post('/', async (req, res) => {
    try {
        const { userId, actorId, type, content, link } = req.body;

        if (!userId || !type || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                actor_id: actorId,
                type: type,
                content: content,
                link: link,
                read: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ notification: data });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
