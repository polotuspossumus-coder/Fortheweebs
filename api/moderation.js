/**
 * Community Moderation API
 * User-driven content moderation system
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Report Content
 * POST /api/moderation/report
 */
router.post('/report', async (req, res) => {
    try {
        const { reporterId, contentType, contentId, reason, details } = req.body;

        if (!reporterId || !contentType || !contentId || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('content_reports')
            .insert({
                reporter_id: reporterId,
                content_type: contentType,
                content_id: contentId,
                reason: reason,
                details: details,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ report: data });
    } catch (error) {
        console.error('Report content error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Pending Reports (Moderator)
 * GET /api/moderation/reports/pending
 */
router.get('/reports/pending', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('content_reports')
            .select('*, reporter:users!reporter_id(id, username)')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({ reports: data || [] });
    } catch (error) {
        console.error('Get pending reports error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Resolve Report (Moderator)
 * POST /api/moderation/reports/resolve
 */
router.post('/reports/resolve', async (req, res) => {
    try {
        const { reportId, moderatorId, action, notes } = req.body;

        if (!reportId || !moderatorId || !action) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { error } = await supabase
            .from('content_reports')
            .update({
                status: 'resolved',
                action: action,
                moderator_id: moderatorId,
                moderator_notes: notes,
                resolved_at: new Date().toISOString()
            })
            .eq('id', reportId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Resolve report error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
