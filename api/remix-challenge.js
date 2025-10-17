const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.post('/create', async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    await db.challenges.insertOne({ title, description, deadline, createdAt: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create challenge.' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { challengeId, slabId, creator } = req.body;
    await db.challengeEntries.insertOne({ challengeId, slabId, creator, votes: 0 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit entry.' });
  }
});

module.exports = router;
