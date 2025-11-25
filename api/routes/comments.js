/**
 * Comments API - Post Comments & Replies
 * Fully integrated with Supabase
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { supabase } = require('../lib/supabaseServer');

/**
 * GET /api/comments/:postId
 * Get all comments for a post
 */
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(id, email, display_name, avatar_url, is_verified)
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Get comments error:', error);
      return res.status(500).json({ error: 'Failed to load comments' });
    }

    // Get reply counts for each comment
    const commentsWithCounts = await Promise.all(
      (data || []).map(async (comment) => {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('parent_comment_id', comment.id);

        const { count: likesCount } = await supabase
          .from('comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', comment.id);

        return {
          ...comment,
          repliesCount: count || 0,
          likesCount: likesCount || 0
        };
      })
    );

    res.json({
      comments: commentsWithCounts,
      hasMore: data && data.length === parseInt(limit),
      total: data ? data.length : 0
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

/**
 * POST /api/comments/create
 * Create a new comment or reply
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { userId, email } = req.user;
    const { postId, body, parentCommentId } = req.body;

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    if (body.length > 2000) {
      return res.status(400).json({ error: 'Comment too long (max 2000 characters)' });
    }

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        parent_comment_id: parentCommentId || null,
        author_id: userId,
        body
      }])
      .select(`
        *,
        author:users(id, email, display_name, avatar_url, is_verified)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }

    console.log(`💬 Comment created on post ${postId} by ${email}`);

    res.status(201).json({
      ...data,
      likesCount: 0,
      repliesCount: 0
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

/**
 * DELETE /api/comments/:commentId
 * Delete a comment (author only)
 */
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { commentId } = req.params;

    // Delete from Supabase (RLS will check ownership)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', userId);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }

    console.log(`🗑️ Comment ${commentId} deleted by user ${userId}`);

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

/**
 * POST /api/comments/:commentId/like
 * Like/unlike a comment
 */
router.post('/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { commentId } = req.params;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      await supabase.from('comment_likes').delete().eq('id', existingLike.id);

      const { count } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId);

      console.log(`💔 Comment ${commentId} unliked by user ${userId}`);
      return res.json({ success: true, liked: false, likesCount: count || 0 });
    } else {
      // Like
      await supabase.from('comment_likes').insert([{ comment_id: commentId, user_id: userId }]);

      const { count } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId);

      console.log(`❤️ Comment ${commentId} liked by user ${userId}`);
      return res.json({ success: true, liked: true, likesCount: count || 0 });
    }
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

/**
 * GET /api/comments/:commentId/replies
 * Get replies to a comment
 */
router.get('/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(id, email, display_name, avatar_url, is_verified)
      `)
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Get replies error:', error);
      return res.status(500).json({ error: 'Failed to load replies' });
    }

    // Get likes count for each reply
    const repliesWithCounts = await Promise.all(
      (data || []).map(async (reply) => {
        const { count: likesCount } = await supabase
          .from('comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', reply.id);

        return {
          ...reply,
          likesCount: likesCount || 0
        };
      })
    );

    res.json({
      replies: repliesWithCounts,
      hasMore: data && data.length === parseInt(limit),
      total: data ? data.length : 0
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ error: 'Failed to load replies' });
  }
});

module.exports = router;
