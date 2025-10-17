const express = require('express');
const router = express.Router();

// POST /remix-suggestions - returns remix suggestions based on tags
const logger = require('../../utils/logger');
router.post('/', async (req, res) => {
  try {
    const { tags = [] } = req.body;
    const suggestions = [];
    if (tags.includes('video')) suggestions.push('Add trending audio');
    if (tags.includes('meme')) suggestions.push('Overlay with viral caption');
    logger.info('Remix suggestions generated', { tags, suggestions });
    res.json({ suggestions });
  } catch {
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

module.exports = router;
