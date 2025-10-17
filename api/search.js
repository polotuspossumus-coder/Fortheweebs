const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Search posts by caption, tags, or creator username
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing search query' });
    // Find users matching the query for username
    const users = await User.find({ username: { $regex: q, $options: 'i' } });
    const userIds = users.map((u) => u._id.toString());
    // Search posts
    const results = await Post.find({
      $or: [
        { caption: { $regex: q, $options: 'i' } },
        { tags: { $in: [q.toLowerCase()] } },
        { creator: { $in: userIds } },
      ],
    }).limit(50);
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

module.exports = router;
