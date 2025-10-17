import { Router } from 'express';
import { getCodex, updateCodex } from '../utils/codex';

const router = Router();


router.get('/codex', (req, res) => {
  let codex = getCodex();
  const { tier, region } = req.query;
  if (tier) codex = codex.filter(e => e.tier === tier);
  if (region) codex = codex.filter(e => e.region === region);
  res.json({ codex });
});

router.post('/codex/update', (req, res) => {
  updateCodex(req.body);
  res.json({ success: true });
});

export default router;
