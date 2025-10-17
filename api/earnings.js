const express = require('express');
const router = express.Router();
const db = require('../lib/database');

// GET /earnings - returns user's earnings based on tier and sales
router.get('/', async (req, res) => {
  try {
    const user = await db.users.findOne({ id: req.user.id });
    const split = { '100': 1.0, '95': 0.95, '85': 0.85, '80': 0.80 }[user.tier];
    const sales = await db.sales.aggregate([
      { $match: { creatorId: req.user.id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.json({ earnings: (sales[0]?.total || 0) * split });
  } catch (err) {
    require('../../utils/logger').error('Earnings fetch failed', { error: err });
    res.status(500).json({ error: 'Failed to fetch earnings.' });
  }
});

module.exports = router;
