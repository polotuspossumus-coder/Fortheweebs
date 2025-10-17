// /api/soundboard.js
const express = require('express');
const router = express.Router();
const sounds = require('./soundLibrary');

// GET /api/soundboard/sounds - list all sounds
router.get('/sounds', (req, res) => res.json(sounds.getAll()));

// POST /api/soundboard/trigger - trigger a sound
router.post('/trigger', (req, res) => {
  const { soundId } = req.body;
  sounds.play(soundId); // Web Audio or server-side trigger
  res.json({ success: true });
});

module.exports = router;
