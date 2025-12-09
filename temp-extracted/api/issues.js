/**
 * Issues API
 * Bug reports and feature requests
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Create Issue
 * POST /api/issues/create
 */
router.post('/create', async (req, res) => {
    try {
        const { userId, type, title, description, screenshot } = req.body;

        if (!userId || !type || !title) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('issues')
            .insert({
                user_id: userId,
                type: type,
                title: title,
                description: description,
                screenshot: screenshot,
                status: 'open',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ issue: data });
    } catch (error) {
        console.error('Create issue error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get User Issues
 * GET /api/issues/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ issues: data || [] });
    } catch (error) {
        console.error('Get user issues error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update Issue Status
 * POST /api/issues/update-status
 */
router.post('/update-status', async (req, res) => {
    try {
        const { issueId, status, resolution } = req.body;

        if (!issueId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { error } = await supabase
            .from('issues')
            .update({
                status: status,
                resolution: resolution,
                updated_at: new Date().toISOString()
            })
            .eq('id', issueId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Update issue status error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
