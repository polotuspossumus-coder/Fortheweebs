const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ValidatorMemorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  assetId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ValidatorMemory = mongoose.model('ValidatorMemory', ValidatorMemorySchema);

// Log validator memory
router.post('/log', async (req, res) => {
  try {
    const { userId, action, assetId } = req.body;
    const entry = new ValidatorMemory({ userId, action, assetId });
    await entry.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to log validator memory' });
  }
});

module.exports = router;
