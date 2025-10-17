const express = require('express');
const router = express.Router();
const db = require('../lib/database');

router.get('/:userId', async (req, res) => {
  try {
    const slabs = await db.slabs.find({ creator: req.params.userId }).toArray();
    const sold = slabs.reduce((sum, s) => sum + (s.sales || 0), 0);
    const earnings = slabs.reduce((sum, s) => sum + (s.sales || 0) * s.price, 0);
    const topSlab = slabs.sort((a, b) => (b.sales || 0) - (a.sales || 0))[0]?.name || 'N/A';
    const tier = await db.tiers.findOne({ userId: req.params.userId });
    res.json({
      total: earnings,
      sold,
      topSlab,
      tier: tier?.level || 'N/A',
      profitShare: tier?.profit || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch storefront analytics.' });
  }
});

module.exports = router;
