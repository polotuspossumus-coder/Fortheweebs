/**
 * Posts API - Social Media Posts
 * Full CRUD + Like/Share/Comment functionality
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { supabase } = require('../lib/supabaseServer');

/**
 * GET /api/posts/feed
 * Get personalized feed for user
 */
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 20, offset = 0 } = req.query;

    // Use Supabase function for feed
    const { data, error } = await supabase.rpc('get_user_feed', {
      user_uuid: userId,
      page_limit: parseInt(limit),
      page_offset: parseInt(offset)
    });

    if (error) {
      console.error('Feed error:', error);
      return res.status(500).json({ error: 'Failed to load feed' });
    }

    res.json({
      posts: data || [],
      hasMore: data && data.length === parseInt(limit),
      total: data ? data.length : 0
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to load feed' });
  }
});

/**
 * POST /api/posts/create
 * Create a new post
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { userId, email } = req.user;
    const { body, visibility, isPaid, priceCents, mediaUrls, hasCGI } = req.body;

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Post body is required' });
    }

    if (body.length > 5000) {
      return res.status(400).json({ error: 'Post too long (max 5000 characters)' });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        author_id: userId,
        body,
        visibility: visibility || 'PUBLIC',
        is_paid: isPaid || false,
        price_cents: isPaid ? (priceCents || 500) : 0,
        media_urls: mediaUrls || [],
        has_cgi: hasCGI || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }

    console.log(`📝 Post created by ${email}: "${body.substring(0, 50)}..."`);

    res.status(201).json(data);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * DELETE /api/posts/:postId
 * Delete a post (author only)
 */
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    // Delete from Supabase (RLS will check ownership)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', userId);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete post' });
    }

    console.log(`🗑️ Post ${postId} deleted by user ${userId}`);

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

/**
 * POST /api/posts/:postId/like
 * Like/unlike a post
 */
router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      await supabase.from('post_likes').delete().eq('id', existingLike.id);
      console.log(`💔 Post ${postId} unliked by user ${userId}`);
      return res.json({ success: true, liked: false });
    } else {
      // Like
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
      console.log(`❤️ Post ${postId} liked by user ${userId}`);
      return res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

/**
 * POST /api/posts/:postId/share
 * Share a post
 */
router.post('/:postId/share', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const post = posts.find(p => p.id === parseInt(postId));

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.sharesCount++;

    // TODO: Track shares in Supabase
    // await supabase.from('post_shares').insert([{
    //   post_id: postId,
    //   user_id: userId,
    //   shared_at: new Date().toISOString()
    // }]);

    console.log(`🔁 Post ${postId} shared by user ${userId}`);

    res.json({
      success: true,
      sharesCount: post.sharesCount
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
});

/**
 * GET /api/posts/:postId
 * Get single post details
 */
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = posts.find(p => p.id === parseInt(postId));

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // TODO: Get from Supabase with full details
    // const { data, error } = await supabase
    //   .from('posts')
    //   .select(`
    //     *,
    //     author:users(*),
    //     likes:post_likes(count),
    //     comments:post_comments(count)
    //   `)
    //   .eq('id', postId)
    //   .single();

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to load post' });
  }
});

module.exports = router;
