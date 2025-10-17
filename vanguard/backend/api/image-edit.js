// /api/image-edit.js
const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const path = require('path');

// POST /api/image-edit/enhance - advanced image editing
router.post('/enhance', async (req, res) => {
  const { imageUrl, edits } = req.body;
  try {
    let image = sharp(imageUrl);
    if (edits.brightness) image = image.modulate({ brightness: edits.brightness });
    if (edits.blur) image = image.blur(edits.blur);
    if (edits.overlay) image = image.composite([{ input: edits.overlay, blend: 'overlay' }]);
    const output = path.join('/tmp', `edited-${Date.now()}.png`);
    await image.toFile(output);
    res.json({ url: output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
