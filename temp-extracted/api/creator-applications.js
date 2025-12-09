/**
 * Creator Applications API
 * Handle applications to become a creator on the platform
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Submit Creator Application
 * POST /api/creator-applications/submit
 */
router.post('/submit', async (req, res) => {
    try {
        const { userId, portfolio, bio, socialLinks, categories } = req.body;

        if (!userId || !bio) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('creator_applications')
            .insert({
                user_id: userId,
                portfolio: portfolio,
                bio: bio,
                social_links: socialLinks,
                categories: categories,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ application: data });
    } catch (error) {
        console.error('Submit creator application error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Application Status
 * GET /api/creator-applications/status/:userId
 */
router.get('/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('creator_applications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({ application: data || null });
    } catch (error) {
        console.error('Get application status error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Approve Application (Admin)
 * POST /api/creator-applications/approve
 */
router.post('/approve', async (req, res) => {
    try {
        const { applicationId, adminId } = req.body;

        if (!applicationId || !adminId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get application
        const { data: app, error: appError } = await supabase
            .from('creator_applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (appError) throw appError;

        // Update application status
        await supabase
            .from('creator_applications')
            .update({
                status: 'approved',
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', applicationId);

        // Update user to creator status
        await supabase
            .from('users')
            .update({
                is_creator: true,
                creator_since: new Date().toISOString()
            })
            .eq('id', app.user_id);

        res.json({ success: true });
    } catch (error) {
        console.error('Approve application error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
