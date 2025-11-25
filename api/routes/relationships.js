/**
 * Relationships API - Friends, Follows, Blocks
 * Fully integrated with Supabase
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { supabase } = require('../lib/supabaseServer');

/**
 * POST /api/relationships/follow
 * Follow a user
 */
router.post('/follow', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', userId)
      .eq('following_id', targetUserId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('follows')
      .insert([{
        follower_id: userId,
        following_id: targetUserId
      }]);

    if (error) {
      console.error('Follow error:', error);
      return res.status(500).json({ error: 'Failed to follow user' });
    }

    console.log(`👁️ User ${userId} followed user ${targetUserId}`);

    res.status(201).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

/**
 * DELETE /api/relationships/follow/:targetUserId
 * Unfollow a user
 */
router.delete('/follow/:targetUserId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetUserId } = req.params;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', targetUserId);

    if (error) {
      console.error('Unfollow error:', error);
      return res.status(500).json({ error: 'Failed to unfollow user' });
    }

    console.log(`👁️ User ${userId} unfollowed user ${targetUserId}`);

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

/**
 * POST /api/relationships/friend-request
 * Send a friend request
 */
router.post('/friend-request', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'You cannot friend yourself' });
    }

    // Normalize IDs (smaller first)
    const user1 = userId < targetUserId ? userId : targetUserId;
    const user2 = userId < targetUserId ? targetUserId : userId;

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_id_1', user1)
      .eq('user_id_2', user2)
      .single();

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      } else {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
    }

    // Insert friendship
    const { error } = await supabase
      .from('friendships')
      .insert([{
        user_id_1: user1,
        user_id_2: user2,
        status: 'pending'
      }]);

    if (error) {
      console.error('Friend request error:', error);
      return res.status(500).json({ error: 'Failed to send friend request' });
    }

    console.log(`👥 User ${userId} sent friend request to user ${targetUserId}`);

    res.status(201).json({
      success: true,
      message: 'Friend request sent'
    });
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

/**
 * POST /api/relationships/friend-request/:targetUserId/accept
 * Accept a friend request
 */
router.post('/friend-request/:targetUserId/accept', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetUserId } = req.params;

    // Normalize IDs
    const user1 = userId < targetUserId ? userId : targetUserId;
    const user2 = userId < targetUserId ? targetUserId : userId;

    const { error } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('user_id_1', user1)
      .eq('user_id_2', user2)
      .eq('status', 'pending');

    if (error) {
      console.error('Accept friend request error:', error);
      return res.status(500).json({ error: 'Failed to accept friend request' });
    }

    console.log(`✅ User ${userId} accepted friend request from ${targetUserId}`);

    res.json({
      success: true,
      message: 'Friend request accepted'
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

/**
 * DELETE /api/relationships/friend/:friendId
 * Remove a friend
 */
router.delete('/friend/:friendId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { friendId } = req.params;

    // Normalize IDs
    const user1 = userId < friendId ? userId : friendId;
    const user2 = userId < friendId ? friendId : userId;

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user_id_1', user1)
      .eq('user_id_2', user2)
      .eq('status', 'accepted');

    if (error) {
      console.error('Remove friend error:', error);
      return res.status(500).json({ error: 'Failed to remove friend' });
    }

    console.log(`💔 User ${userId} removed friend ${friendId}`);

    res.json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

/**
 * GET /api/relationships/friends
 * Get user's friends list
 */
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Get friendships where user is either user_id_1 or user_id_2
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'accepted')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (error) {
      console.error('Get friends error:', error);
      return res.status(500).json({ error: 'Failed to load friends' });
    }

    // Extract friend IDs and get user details
    const friendIds = data.map(f => f.user_id_1 === userId ? f.user_id_2 : f.user_id_1);

    if (friendIds.length === 0) {
      return res.json({ friends: [], count: 0 });
    }

    const { data: friendUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, display_name, avatar_url, is_verified')
      .in('id', friendIds);

    if (usersError) {
      console.error('Get friend users error:', usersError);
      return res.status(500).json({ error: 'Failed to load friend details' });
    }

    res.json({
      friends: friendUsers || [],
      count: friendUsers ? friendUsers.length : 0
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to load friends' });
  }
});

/**
 * GET /api/relationships/followers
 * Get user's followers
 */
router.get('/followers', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:users!follows_follower_id_fkey(id, email, display_name, avatar_url, is_verified),
        created_at
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('Get followers error:', error);
      return res.status(500).json({ error: 'Failed to load followers' });
    }

    const followers = (data || []).map(f => ({
      ...f.follower,
      followedAt: f.created_at
    }));

    res.json({
      followers,
      count: followers.length
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to load followers' });
  }
});

/**
 * GET /api/relationships/following
 * Get users that the current user is following
 */
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:users!follows_following_id_fkey(id, email, display_name, avatar_url, is_verified),
        created_at
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('Get following error:', error);
      return res.status(500).json({ error: 'Failed to load following' });
    }

    const following = (data || []).map(f => ({
      ...f.following,
      followedAt: f.created_at
    }));

    res.json({
      following,
      count: following.length
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to load following' });
  }
});

/**
 * POST /api/relationships/block
 * Block a user
 */
router.post('/block', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    // Check if already blocked
    const { data: existing } = await supabase
      .from('blocks')
      .select('*')
      .eq('blocker_id', userId)
      .eq('blocked_id', targetUserId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'User already blocked' });
    }

    const { error } = await supabase
      .from('blocks')
      .insert([{
        blocker_id: userId,
        blocked_id: targetUserId
      }]);

    if (error) {
      console.error('Block user error:', error);
      return res.status(500).json({ error: 'Failed to block user' });
    }

    console.log(`🚫 User ${userId} blocked user ${targetUserId}`);

    res.status(201).json({
      success: true,
      message: 'User blocked'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

module.exports = router;
