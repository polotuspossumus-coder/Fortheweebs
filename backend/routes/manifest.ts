import { Router } from 'express';
import { getManifest, publishManifest } from '../utils/slabManifest';

const router = Router();

router.get('/manifest', (req, res) => {
  res.json({ manifest: getManifest() });
});

router.post('/manifest/publish', (req, res) => {
  const { protocolId, name, description, linkedSlabs } = req.body;
  const entry = publishManifest(protocolId, name, description, linkedSlabs);
  res.json({ success: true, entry });
});

export default router;
