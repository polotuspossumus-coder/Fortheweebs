const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireTier = require('../middleware/requireTier');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', requireTier('85'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', requireTier('85'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Follow a user
router.post('/:id/follow', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const follower = await User.findById(req.body.followerId);
    if (!user || !follower) return res.status(404).json({ error: 'User not found' });
    if (!user.followers.includes(req.body.followerId)) {
      user.followers.push(req.body.followerId);
      await user.save();
    }
    if (!follower.following.includes(req.params.id)) {
      follower.following.push(req.params.id);
      await follower.save();
    }
    res.json({ message: 'Followed user' });
  } catch {
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.post('/:id/unfollow', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const follower = await User.findById(req.body.followerId);
    if (!user || !follower) return res.status(404).json({ error: 'User not found' });
    user.followers = user.followers.filter((id) => id !== req.body.followerId);
    await user.save();
    follower.following = follower.following.filter((id) => id !== req.params.id);
    await follower.save();
    res.json({ message: 'Unfollowed user' });
  } catch {
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

module.exports = router;
