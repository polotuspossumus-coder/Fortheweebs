import { Router } from 'express';
import { getResurrectionLog, resurrectValidator } from '../utils/resurrectionLog';

const router = Router();

router.get('/resurrections', (req, res) => {
  res.json({ resurrections: getResurrectionLog() });
});

router.post('/resurrections', (req, res) => {
  const { wallet, reason } = req.body;
  const entry = resurrectValidator(wallet, reason);
  res.json({ success: true, entry });
});

export default router;
