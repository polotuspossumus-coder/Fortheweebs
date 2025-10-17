const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/', async (req, res) => {
  try {
    const lore = await db.lorecasts.find({}).sort({ timestamp: -1 }).toArray();
    res.json(
      lore.map((l) => ({
        validator: l.validatorId,
        highlights: l.highlights,
        time: new Date(l.timestamp).toLocaleString(),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lorecast archive.' });
  }
});

module.exports = router;
