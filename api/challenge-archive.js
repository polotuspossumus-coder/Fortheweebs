const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/', async (req, res) => {
  try {
    const challenges = await db.challenges.find({}).sort({ createdAt: -1 }).toArray();
    const entries = await db.challengeEntries.find({}).toArray();
    const archive = challenges.map((c) => {
      const winner =
        entries.filter((e) => e.challengeId === c._id).sort((a, b) => b.votes - a.votes)[0]
          ?.creator || 'No winner';
      return {
        title: c.title,
        winner,
        date: new Date(c.createdAt).toLocaleDateString(),
      };
    });
    res.json(archive);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch challenge archive.' });
  }
});

module.exports = router;
