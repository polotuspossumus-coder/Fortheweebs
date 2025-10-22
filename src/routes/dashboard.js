// src/routes/dashboard.js
import express from 'express';
import { accessOverride } from '../api/_middleware.js';
import routeGuard from '../api/routeGuard.js';
import { initProfile } from '../utils/initProfile.js';
import { logArtifact } from '../utils/logArtifact.js';

const router = express.Router();

router.get('/dashboard', accessOverride, routeGuard, (req, res) => {
  try {
    const profile = initProfile(req.user);
    const artifact = logArtifact();
    res.json({ profile, artifact });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
});

export default router;
