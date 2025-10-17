const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/:slabId', async (req, res) => {
  try {
    let depth = 0;
    let current = await db.slabs.findOne({ _id: req.params.slabId });
    while (current?.remixOf) {
      current = await db.slabs.findOne({ _id: current.remixOf });
      depth++;
    }
    res.json({ depth });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fork depth.' });
  }
});

module.exports = router;
