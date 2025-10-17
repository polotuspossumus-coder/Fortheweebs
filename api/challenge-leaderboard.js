const express = require('express');
const router = express.Router();
const db = require('./lib/database');

router.get('/:challengeId', async (req, res) => {
  try {
    const entries = await db.challengeEntries
      .find({ challengeId: req.params.challengeId })
      .sort({ votes: -1 })
      .toArray();
    const slabs = await db.slabs.find({}).toArray();
    const leaderboard = entries.map((entry) => ({
      creator: entry.creator,
      votes: entry.votes,
      slabName: slabs.find((s) => s._id === entry.slabId)?.name || 'Unknown',
    }));
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

module.exports = router;
