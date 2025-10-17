const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'invite' },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', MessageSchema);

// Send an invite message
router.post('/invite', async (req, res) => {
  try {
    const { targetUserId, message } = req.body;
    const msg = new Message({ from: 'system', to: targetUserId, message, type: 'invite' });
    await msg.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

module.exports = router;
