/**
 * Posts API Route
 * Handles user feed posts
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get Feed Posts
 * GET /api/routes/posts/feed
 */
router.get('/feed', async (req, res) => {
    try {
        const { userId, page = 1, limit = 20 } = req.query;

        const offset = (page - 1) * limit;

        const { data, error } = await supabase
            .from('posts')
            .select('*, user:users(id, username, avatar)')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({ posts: data || [], page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Post
 * POST /api/routes/posts
 */
router.post('/', async (req, res) => {
    try {
        const { userId, content, mediaUrl, visibility = 'public' } = req.body;

        if (!userId || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('posts')
            .insert({
                user_id: userId,
                content: content,
                media_url: mediaUrl,
                visibility: visibility,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ post: data });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Delete Post
 * DELETE /api/routes/posts/:postId
 */
router.delete('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
