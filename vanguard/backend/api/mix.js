// /api/mix.js
const express = require('express');
const router = express.Router();
const { mixTracks } = require('../audioEngine');

// POST /api/mix - mix music tracks
router.post('/mix', async (req, res) => {
  const { tracks, bpm, effects } = req.body;
  try {
    const output = await mixTracks(tracks, bpm, effects);
    res.json({ url: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
