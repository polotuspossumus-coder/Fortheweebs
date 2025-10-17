// Export all slabs for a user
router.get('/:userId', async (req, res) => {
  try {
    const slabs = await db.slabs.find({ creator: req.params.userId }).toArray();
    res.json({ creator: req.params.userId, slabs, exportedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Failed to export slabs' });
  }
});
const express = require('express');
const fs = require('fs');
const router = express.Router();
const db = require('../lib/database');

router.get('/export-slab/:id', async (req, res) => {
  try {
    const slab = await db.slabs.findOne({ id: req.params.id });
    const filePath = `exports/slab-${slab.id}.json`;
    fs.writeFileSync(filePath, JSON.stringify(slab, null, 2));
    require('../../utils/logger').info('Slab exported', { slabId: slab.id, filePath });
    res.download(filePath);
  } catch (err) {
    require('../../utils/logger').error('Slab export failed', { error: err });
    res.status(500).json({ error: 'Failed to export slab.' });
  }
});

module.exports = router;
