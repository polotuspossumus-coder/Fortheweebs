const express = require('express');
const router = express.Router();
const db = require('../lib/database');

router.get('/slab-manifest', async (req, res) => {
  try {
    const slabs = await db.slabs.find().toArray();
    const manifest = slabs.map(s => ({
      name: s.name,
      endpoint: s.endpoint,
      lineage: s.parent ? `Fork of ${s.parent}` : 'Original',
      createdBy: s.createdBy,
    }));
    require('../../utils/logger').info('Slab manifest served', { count: manifest.length });
    res.json(manifest);
  } catch (err) {
    require('../../utils/logger').error('Slab manifest fetch failed', { error: err });
    res.status(500).json({ error: 'Failed to fetch slab manifest.' });
  }
});

module.exports = router;
