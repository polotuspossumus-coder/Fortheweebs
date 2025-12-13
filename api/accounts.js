// Multi-Account System - Stub
// Allows families to share subscriptions

const express = require('express');
const router = express.Router();

// List all linked accounts (placeholder)
router.get('/list', (req, res) => {
  res.json({
    success: true,
    accounts: [],
    message: 'Multi-account system coming soon'
  });
});

// Add linked account (placeholder)
router.post('/link', (req, res) => {
  res.json({
    success: false,
    message: 'Multi-account system not yet implemented'
  });
});

module.exports = router;
