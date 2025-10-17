const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/:slabId', async (req, res) => {
  try {
    const slab = await db.slabs.findOne({ _id: req.params.slabId });
    if (!slab) return res.status(404).json({ error: 'Slab not found.' });
    res.json({
      name: slab.name,
      logic: slab.logic,
      ui: slab.ui,
      remixOf: slab.remixOf,
      tags: slab.tags,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to export slab.' });
  }
});

module.exports = router;
