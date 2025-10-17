const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/:guildId', async (req, res) => {
  try {
    const lore = await db.lorecasts.find({ guildId: req.params.guildId }).toArray();
    res.json(
      lore.map((l) => ({
        validator: l.validatorId,
        highlights: l.highlights,
        time: new Date(l.timestamp).toLocaleString(),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guild lore.' });
  }
});

module.exports = router;
