const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const SlabMarketSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  logic: { type: String, required: true },
  ui: { type: String, required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SlabMarket = mongoose.model('SlabMarket', SlabMarketSchema);

// List a new slab
router.post('/list', async (req, res) => {
  try {
    const { creator, name, logic, ui, price } = req.body;
    const slab = new SlabMarket({ creator, name, logic, ui, price });
    await slab.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to list slab' });
  }
});

module.exports = router;
