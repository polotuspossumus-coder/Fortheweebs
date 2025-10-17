const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const StorefrontSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  assetUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Storefront = mongoose.model('Storefront', StorefrontSchema);

// Get items for a user
router.get('/:userId', async (req, res) => {
  try {
    const items = await Storefront.find({ creator: req.params.userId });
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch storefront items' });
  }
});

// List a new item
router.post('/list', async (req, res) => {
  try {
    const { creator, title, type, price, assetUrl } = req.body;
    const item = new Storefront({ creator, title, type, price, assetUrl });
    await item.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to list item' });
  }
});

module.exports = router;
