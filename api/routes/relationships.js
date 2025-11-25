/**
 * Relationships API - Friends, Follows, Blocks
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Mock database
let friendships = []; // { userId1, userId2, status: 'pending'|'accepted' }
let follows = []; // { followerId, followingId }
let blocks = []; // { blockerId, blockedId }

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
    const existingFollow = follows.find(
      f => f.followerId === userId && f.followingId === targetUserId
    );

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // TODO: Insert into Supabase
    // const { data, error } = await supabase
    //   .from('follows')
    //   .insert([{
    //     follower_id: userId,
    //     following_id: targetUserId
    //   }])
    //   .select()
    //   .single();

    follows.push({
      followerId: userId,
      followingId: targetUserId,
      createdAt: new Date().toISOString()
    });

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

    const followIndex = follows.findIndex(
      f => f.followerId === userId && f.followingId === targetUserId
    );

    if (followIndex === -1) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    // TODO: Delete from Supabase
    follows.splice(followIndex, 1);

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

    // Check if already friends or pending
    const existingFriendship = friendships.find(
      f => (f.userId1 === userId && f.userId2 === targetUserId) ||
           (f.userId1 === targetUserId && f.userId2 === userId)
    );

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      } else {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
    }

    // TODO: Insert into Supabase
    friendships.push({
      userId1: userId,
      userId2: targetUserId,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });

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
 * POST /api/relationships/friend-request/:requestId/accept
 * Accept a friend request
 */
router.post('/friend-request/:targetUserId/accept', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetUserId } = req.params;

    const friendship = friendships.find(
      f => f.userId1 === targetUserId && f.userId2 === userId && f.status === 'pending'
    );

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    friendship.status = 'accepted';
    friendship.acceptedAt = new Date().toISOString();

    // TODO: Update in Supabase
    // await supabase
    //   .from('friendships')
    //   .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    //   .eq('id', requestId);

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

    const friendshipIndex = friendships.findIndex(
      f => ((f.userId1 === userId && f.userId2 === friendId) ||
            (f.userId1 === friendId && f.userId2 === userId)) &&
           f.status === 'accepted'
    );

    if (friendshipIndex === -1) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    friendships.splice(friendshipIndex, 1);

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

    const userFriends = friendships
      .filter(f =>
        ((f.userId1 === userId || f.userId2 === userId) && f.status === 'accepted')
      )
      .map(f => ({
        friendId: f.userId1 === userId ? f.userId2 : f.userId1,
        since: f.acceptedAt
      }));

    // TODO: Get full user details from Supabase
    res.json({
      friends: userFriends,
      count: userFriends.length
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

    const userFollowers = follows
      .filter(f => f.followingId === userId)
      .map(f => ({
        userId: f.followerId,
        followedAt: f.createdAt
      }));

    res.json({
      followers: userFollowers,
      count: userFollowers.length
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

    const userFollowing = follows
      .filter(f => f.followerId === userId)
      .map(f => ({
        userId: f.followingId,
        followedAt: f.createdAt
      }));

    res.json({
      following: userFollowing,
      count: userFollowing.length
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
    const existingBlock = blocks.find(
      b => b.blockerId === userId && b.blockedId === targetUserId
    );

    if (existingBlock) {
      return res.status(400).json({ error: 'User already blocked' });
    }

    blocks.push({
      blockerId: userId,
      blockedId: targetUserId,
      createdAt: new Date().toISOString()
    });

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
