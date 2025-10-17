const express = require('express');
const router = express.Router();
const ValidatorMemory = require('../models/ValidatorMemory');

// Search validator memory logs
router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    const results = await ValidatorMemory.find({
      $or: [
        { action: { $regex: query, $options: 'i' } },
        { userId: { $regex: query, $options: 'i' } },
      ],
    }).limit(50);
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to search memory logs' });
  }
});

module.exports = router;
