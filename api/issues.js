const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get all user issues
 * GET /api/issues/:userId
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.query;

        let query = supabase
            .from('user_issues')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            issues: data || [],
            count: data?.length || 0
        });

    } catch (error) {
        console.error('Get issues error:', error);
        res.status(500).json({
            error: error.message || 'Failed to get issues'
        });
    }
});

/**
 * Create new issue
 * POST /api/issues
 */
router.post('/', async (req, res) => {
    try {
        const { userId, issueType, description, context } = req.body;

        if (!userId || !issueType || !description) {
            return res.status(400).json({
                error: 'userId, issueType, and description are required'
            });
        }

        const { data, error } = await supabase
            .from('user_issues')
            .insert({
                user_id: userId,
                issue_type: issueType,
                description: description,
                context: context || {},
                status: 'open',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            issue: data
        });

    } catch (error) {
        console.error('Create issue error:', error);
        res.status(500).json({
            error: error.message || 'Failed to create issue'
        });
    }
});

/**
 * Update issue status
 * PATCH /api/issues/:issueId
 */
router.patch('/:issueId', async (req, res) => {
    try {
        const { issueId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: 'status is required'
            });
        }

        const updateData = {
            status: status,
            updated_at: new Date().toISOString()
        };

        if (status === 'resolved' || status === 'closed') {
            updateData.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('user_issues')
            .update(updateData)
            .eq('id', issueId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            issue: data
        });

    } catch (error) {
        console.error('Update issue error:', error);
        res.status(500).json({
            error: error.message || 'Failed to update issue'
        });
    }
});

/**
 * Delete issue
 * DELETE /api/issues/:issueId
 */
router.delete('/:issueId', async (req, res) => {
    try {
        const { issueId } = req.params;

        const { error } = await supabase
            .from('user_issues')
            .delete()
            .eq('id', issueId);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Issue deleted'
        });

    } catch (error) {
        console.error('Delete issue error:', error);
        res.status(500).json({
            error: error.message || 'Failed to delete issue'
        });
    }
});

module.exports = router;
