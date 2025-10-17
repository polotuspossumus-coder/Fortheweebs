const express = require('express');
const router = express.Router();
const db = require('../lib/database');

router.get('/', async (req, res) => {
  try {
    const protocols = await db.protocols.find().sort({ createdAt: -1 }).limit(50).toArray();
    require('../../utils/logger').info('Genesis feed served', { count: protocols.length });
    res.json(protocols.map(p => ({
      name: p.name,
      createdAt: new Date(p.createdAt).toLocaleString(),
      id: p._id,
    })));
  } catch (err) {
    require('../../utils/logger').error('Genesis feed fetch failed', { error: err });
    res.status(500).json({ error: 'Failed to fetch genesis feed.' });
  }
});

module.exports = router;
