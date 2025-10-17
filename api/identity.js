const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const IdentitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  lore: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Identity = mongoose.model('Identity', IdentitySchema);

// Create a new identity
router.post('/create', async (req, res) => {
  try {
    const { userId, name, avatarUrl, lore } = req.body;
    const identity = new Identity({ userId, name, avatarUrl, lore });
    await identity.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to create identity' });
  }
});

module.exports = router;
