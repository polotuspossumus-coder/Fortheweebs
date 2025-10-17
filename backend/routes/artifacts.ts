import express from 'express';
import { Artifact } from '../models/Artifact';

const router = express.Router();

router.post('/artifacts', async (req, res) => {
  try {
    const artifact = new Artifact(req.body);
    await artifact.save();
    res.status(201).json({ message: 'Artifact deployed' });
  } catch (err) {
    res.status(500).json({ message: 'Artifact deployment failed', error: err });
  }
});

router.get('/artifacts/:slug', async (req, res) => {
  try {
    const artifact = await Artifact.findOne({ slug: req.params.slug });
    if (!artifact) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(artifact);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err });
  }
});

export default router;
