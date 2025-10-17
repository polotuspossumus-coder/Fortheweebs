const express = require('express');
const router = express.Router();
const db = require('../lib/database');
const ai = require('../lib/api');

// POST /api/slab-translate
router.post('/', async (req, res) => {
  try {
    const { slabId, targetLang } = req.body;
    const slab = await db.slabs.findOne({ _id: slabId });
    if (!slab) {
      return res.status(404).json({ error: 'Slab not found' });
    }
    const translated = await ai.translateSlab(slab, targetLang);
    res.json(translated);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to translate slab',
      details:
        typeof err === 'object' && err !== null && 'message' in err ? err.message : String(err),
    });
  }
});

module.exports = router;
