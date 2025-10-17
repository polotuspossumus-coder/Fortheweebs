const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/', async (req, res) => {
  try {
    const logs = await db.resurrections.find({}).sort({ timestamp: -1 }).toArray();
    res.json(logs.map(log => ({
      slabId: log.slabId,
      resurrectedBy: log.userId,
      time: new Date(log.timestamp).toLocaleString(),
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resurrection logs.' });
  }
});

module.exports = router;
