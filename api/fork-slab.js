const express = require('express');
const router = express.Router();
const db = require('../lib/database');
const { ObjectId } = require('mongodb');

router.post('/fork-slab', async (req, res) => {
  try {
    const { slabId, userId, changes } = req.body;
    const original = await db.slabs.findOne({ id: slabId });
    const forked = {
      ...original,
      id: new ObjectId(),
      parent: slabId,
      createdBy: userId,
      changes,
      timestamp: Date.now(),
    };
    await db.slabs.insertOne(forked);
    require('../../utils/logger').info('Slab forked', { slabId, userId, forkedId: forked.id });
    res.json({ forkedId: forked.id });
  } catch (err) {
    require('../../utils/logger').error('Slab fork failed', { error: err });
    res.status(500).json({ error: 'Failed to fork slab.' });
  }
});

module.exports = router;
