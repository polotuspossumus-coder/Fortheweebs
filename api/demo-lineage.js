const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Get remix lineage for a post
router.get('/:postId', async (req, res) => {
  try {
    const lineage = await Post.find({ remixOf: req.params.postId });
    const nodes = [{ id: req.params.postId }];
    const links = lineage.map(child => ({ source: req.params.postId, target: child._id }));
    res.json({ nodes, links });
  } catch {
    res.status(500).json({ error: 'Failed to fetch remix lineage' });
  }
});

module.exports = router;
