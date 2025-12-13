/**
 * Comments API Route
 * Handles post comments and replies
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get Comments for Post
 * GET /api/routes/comments/:postId
 */
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        const { data, error } = await supabase
            .from('comments')
            .select('*, user:users(id, username, avatar)')
            .eq('post_id', postId)
            .is('parent_id', null)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({ comments: data || [] });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Comment
 * POST /api/routes/comments
 */
router.post('/', async (req, res) => {
    try {
        const { userId, postId, content, parentId = null } = req.body;

        if (!userId || !postId || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('comments')
            .insert({
                user_id: userId,
                post_id: postId,
                parent_id: parentId,
                content: content,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ comment: data });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Delete Comment
 * DELETE /api/routes/comments/:commentId
 */
router.delete('/:commentId', async (req, res) => {
    try {
        const { userId, commentId } = req.params;
        

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
