const express = require('express');
const router = express.Router();
const db = require('../lib/database');

// POST /feedback - stores user feedback/suggestions
router.post('/feedback', async (req, res) => {
  try {
    const { userId, suggestion } = req.body;
    await db.feedback.insertOne({ userId, suggestion, timestamp: Date.now() });
    require('../../utils/logger').info('Feedback submitted', { userId, suggestion });
    res.json({ success: true });
  } catch (err) {
    require('../../utils/logger').error('Feedback submission failed', { error: err });
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

module.exports = router;
