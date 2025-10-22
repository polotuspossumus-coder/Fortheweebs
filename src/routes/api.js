import express from 'express';
import Artifact from '../lib/ProfileArtifact.js';
import { getUserTier } from '../utils/tierLogic.js';

const router = express.Router();

router.get('/api/artifacts/:userId', async (req, res) => {
  const artifacts = await Artifact.find({ userId: req.params.userId });
  res.json(artifacts);
});

router.get('/api/tier/:userId', async (req, res) => {
  const tier = await getUserTier(req.params.userId);
  res.json({ tier });
});

export default router;
