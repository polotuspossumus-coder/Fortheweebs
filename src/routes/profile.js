// src/routes/profile.js
import express from 'express';
import accessOverride from '../api/_middleware.js';
import routeGuard from '../api/routeGuard.js';

const router = express.Router();

// Route: /profile/init
router.get('/profile/init', accessOverride, routeGuard, (req, res) => {
  const user = req.user;

  if (!user.profileAccess) {
    return res.status(403).json({ error: 'Profile access denied.' });
  }

  const profile = {
    id: user.id,
    username: 'Polotus',
    avatar: '/avatars/polotus.png',
    bio: 'Sovereign founder of Vanguard and Fortheweebs. Architect of creator-first infrastructure.',
    legacyStatus: 'MythicFounder',
    modules: [
      'Canvas Forge',
      'Sound Forge',
      'Video Forge',
      'CGI Generator',
      'Analytics',
      'Campaign Triggers',
      'Artifact Monetization',
      'User Profile Generator',
    ],
    artifactLog: [
      {
        artifact: 'PolotusAccessBypass',
        type: 'AccessOverride',
        createdBy: 'system',
        timestamp: new Date().toISOString(),
        details: {
          user: 'jacob.morris',
          role: 'MythicFounder',
          bypass: ['accountCreation', 'paymentGate'],
          granted: true,
        },
      },
    ],
  };

  res.json({ profile });
});

export default router;
