const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['follow', 'remix', 'comment'], required: true },
  payload: mongoose.Schema.Types.Mixed,
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', NotificationSchema);

// Create a notification
router.post('/', async (req, res) => {
  try {
    const { toUserId, type, payload } = req.body;
    const notification = new Notification({
      toUserId,
      type,
      payload,
    });
    await notification.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;
