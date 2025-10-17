const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/:userId', async (req, res) => {
  try {
    const posts = await db.posts.find({ creator: req.params.userId }).sort({ timestamp: 1 }).toArray();
    const gaps = posts.map((p, i) => i > 0 ? p.timestamp - posts[i - 1].timestamp : 0);
    res.json({ gaps });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch burnout timeline.' });
  }
});

module.exports = router;
