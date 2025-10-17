const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

// Remix a post
const requireTier = require('../middleware/requireTier');

router.post('/', requireTier('80'), async (req, res) => {
  try {
    const { originalId, userId, changes } = req.body;
    // Find the original post
    const original = await Post.findById(originalId);
    if (!original) return res.status(404).json({ error: 'Original post not found' });
    // Create the remix post
    const remix = new Post({
      creator: userId,
      remixOf: originalId,
      mediaUrl: changes.mediaUrl || original.mediaUrl,
      caption: changes.caption || original.caption,
      tags: changes.tags || original.tags,
      license: changes.license || original.license,
      createdAt: Date.now(),
    });
    await remix.save();
    res.json({ success: true, remix });
  } catch {
    res.status(500).json({ error: 'Failed to create remix' });
  }
});

module.exports = router;
