const express = require('express');
const router = express.Router();
const db = require('../lib/database');

router.get('/', async (_req, res) => {
  try {
    const slabs = await db.slabs.find({}).toArray();
  res.json(slabs.map(s => ({
      id: s._id,
      name: s.name,
      tags: s.tags,
      remixOf: s.remixOf,
      creator: s.creator,
    })));
  } catch (err) {
  res.status(500).json({ error: 'Failed to fetch slab manifest', details: typeof err === 'object' && err !== null && 'message' in err ? err.message : String(err) });
  }
});

module.exports = router;
