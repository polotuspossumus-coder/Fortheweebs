import express from 'express';
import { requireRole } from '../utils/requireRole.js';
import { logLedger } from '../utils/ledger.js';

const router = express.Router();

router.post('/', requireRole('jacob'), async (req, res) => {
  const { targetId, reason } = req.body;
  await logLedger('ban', req.user.id, targetId, { reason });
  res.json({ status: 'Ban triggered and logged' });
});

export default router;
