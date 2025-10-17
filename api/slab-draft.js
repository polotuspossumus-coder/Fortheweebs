const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.post('/save', async (req, res) => {
  try {
    const { userId, draft } = req.body;
    await db.slabDrafts.updateOne(
      { userId },
      { $set: { draft, updatedAt: Date.now() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save slab draft.' });
  }
});

module.exports = router;
