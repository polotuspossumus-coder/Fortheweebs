// User Info & VIP Status API

const express = require('express');
const router = express.Router();

// Get user info
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Check if VIP
  const vipEmails = [
    'polotuspossumus@gmail.com', // Owner
    'vip1@example.com',
    // Add more VIP emails here
  ];
  
  res.json({
    userId,
    isVIP: vipEmails.includes(userId),
    tier: 'FREE',
    message: 'User info endpoint'
  });
});

// Get VIP status
router.get('/:userId/vip-status', (req, res) => {
  const { userId } = req.params;
  
  const vipEmails = ['polotuspossumus@gmail.com'];
  
  res.json({
    isVIP: vipEmails.includes(userId),
    isOwner: userId === 'polotuspossumus@gmail.com'
  });
});

module.exports = router;
