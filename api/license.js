const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  licenseType: { type: String, required: true },
  terms: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const License = mongoose.model('License', LicenseSchema);

// Assign a license to a post
router.post('/assign', async (req, res) => {
  try {
    const { postId, licenseType, terms } = req.body;
    const license = new License({ postId, licenseType, terms });
    await license.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to assign license' });
  }
});

module.exports = router;
