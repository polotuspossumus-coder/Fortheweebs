const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DAOSchema = new mongoose.Schema({
  slabId: { type: mongoose.Schema.Types.ObjectId, ref: 'SlabMarket', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rules: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const DAO = mongoose.model('DAO', DAOSchema);

// Create a new DAO
router.post('/create', async (req, res) => {
  try {
    const { slabId, creator, members, rules } = req.body;
    const dao = new DAO({ slabId, creator, members, rules });
    await dao.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to create DAO' });
  }
});

module.exports = router;
