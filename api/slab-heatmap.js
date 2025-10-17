const express = require('express');
const router = express.Router();
const db = require('../lib/database');

// GET /api/slab-heatmap/:slabId
router.get('/:slabId', async (req, res) => {
  try {
    const events = await db.slabAnalytics.find({ slabId: req.params.slabId }).toArray();
    const heatmap = events.reduce((acc, e) => {
      const hour = new Date(e.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    res.json(heatmap);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch slab heatmap',
      details:
        typeof err === 'object' && err !== null && 'message' in err ? err.message : String(err),
    });
  }
});

module.exports = router;
