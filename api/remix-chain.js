const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/:slabId', async (req, res) => {
  try {
    const chain = [];
    let current = await db.slabs.findOne({ _id: req.params.slabId });
    while (current) {
      chain.unshift(current);
      current = current.remixOf ? await db.slabs.findOne({ _id: current.remixOf }) : null;
    }
    res.json(chain.map((s) => ({ id: s._id, name: s.name })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch remix chain.' });
  }
});

module.exports = router;
