/**
 * Comments API - Post Comments & Replies
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Mock database
let comments = [];
let commentIdCounter = 1;

/**
 * GET /api/comments/:postId
 * Get all comments for a post
 */
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // TODO: Replace with Supabase
    // const { data, error } = await supabase
    //   .from('comments')
    //   .select('*, author:users(*), replies:comments(*)')
    //   .eq('post_id', postId)
    //   .is('parent_comment_id', null)
    //   .order('created_at', { ascending: false })
    //   .range(offset, offset + limit - 1);

    const postComments = comments
      .filter(c => c.postId === parseInt(postId) && !c.parentCommentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + limit);

    // Get reply counts
    postComments.forEach(comment => {
      comment.repliesCount = comments.filter(c => c.parentCommentId === comment.id).length;
    });

    res.json({
      comments: postComments,
      hasMore: offset + limit < postComments.length,
      total: postComments.length
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

    const newComment = {
      id: commentIdCounter++,
      postId: parseInt(postId),
      parentCommentId: parentCommentId || null,
      authorId: userId,
      author: {
        id: userId,
        email,
        displayName: req.user.displayName || email.split('@')[0],
        avatar: '👤'
      },
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0
    };

    // TODO: Insert into Supabase
    // const { data, error } = await supabase
    //   .from('comments')
    //   .insert([{
    //     post_id: postId,
    //     parent_comment_id: parentCommentId,
    //     author_id: userId,
    //     body
    //   }])
    //   .select()
    //   .single();

    comments.push(newComment);

    console.log(`💬 Comment created on post ${postId} by ${email}`);

    res.status(201).json(newComment);
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

    const commentIndex = comments.findIndex(c => c.id === parseInt(commentId));

    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = comments[commentIndex];

    // Check ownership
    if (comment.authorId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // TODO: Delete from Supabase
    // const { error } = await supabase
    //   .from('comments')
    //   .delete()
    //   .eq('id', commentId)
    //   .eq('author_id', userId);

    comments.splice(commentIndex, 1);

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

    const comment = comments.find(c => c.id === parseInt(commentId));

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // TODO: Track likes in Supabase
    comment.likesCount++;

    console.log(`❤️ Comment ${commentId} liked by user ${userId}`);

    res.json({
      success: true,
      likesCount: comment.likesCount,
      liked: true
    });
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

    // TODO: Get from Supabase
    const replies = comments
      .filter(c => c.parentCommentId === parseInt(commentId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(offset, offset + limit);

    res.json({
      replies,
      hasMore: offset + limit < replies.length,
      total: replies.length
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ error: 'Failed to load replies' });
  }
});

module.exports = router;
