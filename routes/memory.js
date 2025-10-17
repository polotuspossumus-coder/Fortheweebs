const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Assuming you have a ValidatorMemory model
const ValidatorMemory = require('../models/ValidatorMemory');

// Get recent validator memory feed
const requireTier = require('../middleware/requireTier');

router.get('/feed', requireTier('80'), async (req, res) => {
  try {
    const logs = await ValidatorMemory.find().sort({ timestamp: -1 }).limit(50);
    res.json(
      logs.map((log) => ({
        action: log.action,
        user: log.userId,
        artifact: log.assetId,
        time: new Date(log.timestamp).toLocaleString(),
      }))
    );
  } catch {
    res.status(500).json({ error: 'Failed to fetch memory feed' });
  }
});

module.exports = router;
