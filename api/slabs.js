const express = require('express');
const router = express.Router();
const db = require('../lib/database');

// GET /slabs - returns all slabs
router.get('/slabs', async (req, res) => {
  try {
    const slabs = await db.slabs.find().toArray();
    require('../../utils/logger').info('Slabs fetched', { count: slabs.length });
    res.json(slabs);
  } catch (err) {
    require('../../utils/logger').error('Slabs fetch failed', { error: err });
    res.status(500).json({ error: 'Failed to fetch slabs.' });
  }
});

module.exports = router;
