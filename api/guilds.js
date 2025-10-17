const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  purpose: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Guild = mongoose.model('Guild', GuildSchema);

// Create a new guild
router.post('/create', async (req, res) => {
  try {
    const { name, members, purpose } = req.body;
    const guild = new Guild({ name, members, purpose });
    await guild.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to create guild' });
  }
});

module.exports = router;
