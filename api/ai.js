const express = require('express');
const router = express.Router();

// POST /ai/text - generate text from prompt
router.post('/text', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ai.generateText(prompt);
    res.json({ result: response });
  } catch {
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// POST /ai/image - generate image from prompt
router.post('/image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageUrl = await ai.generateImage(prompt);
    res.json({ imageUrl });
  } catch {
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

module.exports = router;
