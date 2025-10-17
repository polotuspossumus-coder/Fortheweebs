const express = require('express');
const router = express.Router();
const db = require('../lib/database');

// GET /lore-feed - returns latest validator memory logs as lore feed
router.get('/lore-feed', async (req, res) => {
  try {
    const logs = await db.validatorMemory.find().sort({ timestamp: -1 }).limit(50);
    require('../../utils/logger').info('Lore feed fetched', { count: logs.length });
    const lore = logs.map(log => ({
      user: log.userId,
      action: log.action,
      artifact: log.assetId,
      time: new Date(log.timestamp).toLocaleString(),
    }));
    res.json(lore);
  } catch (err) {
    require('../../utils/logger').error('Lore feed fetch failed', { error: err });
    res.status(500).json({ error: 'Failed to fetch lore feed.' });
  }
});

module.exports = router;
