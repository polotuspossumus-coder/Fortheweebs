const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Upgrade user tier
router.post('/', async (req, res) => {
  try {
    const { userId, newTier, paymentAmount } = req.body;
    const valid = {
      '100': paymentAmount === 100,
      '95': paymentAmount === 100,
      '85': paymentAmount === 50,
      '80': paymentAmount === 15,
    };
    if (!valid[newTier]) return res.status(400).json({ error: 'Invalid payment for tier' });
    await User.updateOne({ _id: userId }, { $set: { tier: newTier } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to upgrade tier' });
  }
});

module.exports = router;
