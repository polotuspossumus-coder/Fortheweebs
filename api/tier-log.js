const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ValidatorMemorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ValidatorMemory = mongoose.model('ValidatorMemory', ValidatorMemorySchema);

// Log tier upgrade
router.post('/', async (req, res) => {
  try {
    const { userId, newTier } = req.body;
    const entry = new ValidatorMemory({ userId, action: `Upgraded to Tier ${newTier}` });
    await entry.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to log tier upgrade' });
  }
});

module.exports = router;
