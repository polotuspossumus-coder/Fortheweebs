/**
 * Time Machine API
 * Version control and project history
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Create Snapshot
 * POST /api/time-machine/snapshot
 */
router.post('/snapshot', async (req, res) => {
    try {
        const { userId, projectId, description } = req.body;

        if (!projectId || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('project_snapshots')
            .insert({
                project_id: projectId,
                user_id: userId,
                description: description,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ snapshot: data });
    } catch (error) {
        console.error('Create snapshot error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Project History
 * GET /api/time-machine/history/:projectId
 */
router.get('/history/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        const { data, error } = await supabase
            .from('project_snapshots')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ history: data || [] });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
