const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Serve embeddable HTML for a post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send('Post not found');
    res.send(
      `<!DOCTYPE html><html><body><img src="${post.mediaUrl}" alt="media" style="max-width:100%" /><p>${post.caption}</p></body></html>`
    );
  } catch {
    res.status(500).send('Failed to load embed');
  }
});

module.exports = router;
