const express = require('express');
const router = express.Router();
const db = require('../lib/database');
const { ObjectId } = require('mongodb');

// POST /fork - forks an artifact and logs changes
router.post('/fork', async (req, res) => {
  try {
    const { artifactId, userId, changes } = req.body;
    const original = await db.artifacts.findById(artifactId);
    const forked = {
      ...original,
      id: new ObjectId(),
      parent: artifactId,
      creator: userId,
      changes,
      timestamp: Date.now(),
    };
    await db.artifacts.insertOne(forked);
    require('../../utils/logger').info('Artifact forked', { artifactId, userId, forkedId: forked.id });
    require('../../utils/remixLogger')({ userId, originalAsset: artifactId, changes, timestamp: Date.now(), forkedId: forked.id });
    res.json({ forkedId: forked.id });
  } catch (err) {
    require('../../utils/logger').error('Artifact fork failed', { error: err });
    res.status(500).json({ error: 'Failed to fork artifact.' });
  }
});

module.exports = router;
