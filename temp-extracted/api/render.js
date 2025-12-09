/**
 * Cloud Rendering API
 * High-performance cloud-based rendering
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Submit Render Job
 * POST /api/render/submit
 */
router.post('/submit', async (req, res) => {
    try {
        const { userId, projectId, settings } = req.body;

        if (!userId || !projectId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('render_jobs')
            .insert({
                user_id: userId,
                project_id: projectId,
                settings: settings,
                status: 'queued',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ job: data });
    } catch (error) {
        console.error('Submit render job error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Render Status
 * GET /api/render/status/:jobId
 */
router.get('/status/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        const { data, error } = await supabase
            .from('render_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error) throw error;

        res.json({ job: data });
    } catch (error) {
        console.error('Get render status error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
