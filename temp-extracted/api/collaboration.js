/**
 * Collaboration Rooms API
 * Real-time collaboration features
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Create Collaboration Room
 * POST /api/collaboration/create
 */
router.post('/create', async (req, res) => {
    try {
        const { creatorId, name, type = 'project' } = req.body;

        if (!creatorId || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('collaboration_rooms')
            .insert({
                creator_id: creatorId,
                name: name,
                type: type,
                active: true,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ room: data });
    } catch (error) {
        console.error('Create collaboration room error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Join Collaboration Room
 * POST /api/collaboration/join
 */
router.post('/join', async (req, res) => {
    try {
        const { roomId, userId } = req.body;

        if (!roomId || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('room_participants')
            .insert({
                room_id: roomId,
                user_id: userId,
                joined_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ participant: data });
    } catch (error) {
        console.error('Join collaboration room error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
