const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  mediaUrl: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', MessageSchema);

// Send a message
router.post('/', async (req, res) => {
  try {
    const { from, to, message, mediaUrl } = req.body;
    const msg = new Message({ from, to, message, mediaUrl });
    await msg.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
