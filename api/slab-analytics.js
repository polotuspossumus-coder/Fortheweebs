const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const SlabAnalyticsSchema = new mongoose.Schema({
  slabId: { type: mongoose.Schema.Types.ObjectId, ref: 'SlabMarket', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SlabAnalytics = mongoose.model('SlabAnalytics', SlabAnalyticsSchema);

// Track slab analytics
router.post('/track', async (req, res) => {
  try {
    const { slabId, userId, action } = req.body;
    const entry = new SlabAnalytics({ slabId, userId, action });
    await entry.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to track slab analytics' });
  }
});

module.exports = router;
