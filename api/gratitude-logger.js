/**
 * Gratitude Logger API
 * Tracks AI-assisted work and credits to models/tools used
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Log AI Usage
 * POST /api/gratitude-logger/log
 */
router.post('/log', async (req, res) => {
    try {
        const { userId, projectId, aiModel, feature } = req.body;

        if (!userId || !aiModel || !feature) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('ai_usage_log')
            .insert({
                user_id: userId,
                project_id: projectId,
                ai_model: aiModel,
                feature: feature,
                metadata: metadata,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ log: data });
    } catch (error) {
        console.error('Log AI usage error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Project Credits
 * GET /api/gratitude-logger/credits/:projectId
 */
router.get('/credits/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        const { data, error } = await supabase
            .from('ai_usage_log')
            .select('ai_model, feature')
            .eq('project_id', projectId);

        if (error) throw error;

        // Aggregate credits
        const credits = {};
        data?.forEach(log => {
            const key = `${log.ai_model}-${log.feature}`;
            credits[key] = (credits[key] || 0) + 1;
        });

        res.json({ credits, projectId });
    } catch (error) {
        console.error('Get project credits error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
