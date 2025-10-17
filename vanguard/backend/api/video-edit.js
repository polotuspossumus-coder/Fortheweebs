// /api/video-edit.js
const express = require('express');
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// POST /api/video-edit/edit - advanced video editing
router.post('/edit', (req, res) => {
  const { videoUrl, edits } = req.body;
  const output = path.join('/tmp', `edited-${Date.now()}.mp4`);
  let command = ffmpeg(videoUrl);
  if (edits.trim) command = command.setStartTime(edits.trim.start).setDuration(edits.trim.duration);
  if (edits.text) command = command.videoFilters(`drawtext=text='${edits.text}':x=10:y=H-th-10`);
  command
    .output(output)
    .on('end', () => res.json({ url: output }))
    .on('error', (err) => res.status(500).json({ error: err.message }))
    .run();
});

module.exports = router;
