import express from 'express';
import { logLedger } from '../utils/ledger';
import { requireRole } from '../lib/requireRole';
const router = express.Router();

router.post('/propose-ban', requireRole('council'), async (req, res) => {
  const { targetId, evidence } = req.body;
  await logLedger('ban_proposal', req.user.id, targetId, { evidence });
  res.json({ status: 'Ban proposal logged for Jacob review' });
});

export default router;
