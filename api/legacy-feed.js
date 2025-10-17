const express = require('express');
const router = express.Router();
const db = require('../lib/database');

// GET /legacy-feed - returns latest 100 artifacts with lineage info
router.get('/legacy-feed', async (req, res) => {
  try {
    const artifacts = await db.artifacts.find().sort({ timestamp: -1 }).limit(100).toArray();
    require('../../utils/logger').info('Legacy feed fetched', { count: artifacts.length });
    res.json(artifacts.map(a => ({
      title: a.title,
      creator: a.creator,
      remixLineage: a.parent ? `Fork of ${a.parent}` : 'Original',
      url: `/artifacts/${a.id}`,
    })));
  } catch (err) {
    require('../../utils/logger').error('Legacy feed fetch failed', { error: err });
    res.status(500).json({ error: 'Failed to fetch legacy feed.' });
  }
});

module.exports = router;
