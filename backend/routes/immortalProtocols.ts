import { Router } from 'express';
import { listImmortalProtocols, immortalizeProtocol } from '../utils/protocolImmortalizer';

const router = Router();


router.get('/immortal-protocols', (req, res) => {
  let protocols = listImmortalProtocols();
  const { status } = req.query;
  if (status) protocols = protocols.filter(p => p.status === status);
  res.json({ protocols });
});

router.post('/protocols/immortalize', (req, res) => {
  const { name, description } = req.body;
  const entry = immortalizeProtocol(name, description);
  res.json({ success: true, entry });
});

export default router;
