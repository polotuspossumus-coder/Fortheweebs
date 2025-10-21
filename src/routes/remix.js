import express from 'express';
import { requireRole } from '../utils/requireRole.js';
import { logLedger } from '../utils/ledger.js';

const router = express.Router();

router.post('/remix', requireRole('jacob'), async (req, res) => {
  const { tributeId, remixType } = req.body;
  // TODO: remix logic (e.g. generate new tribute from template)
  await logLedger('tribute_remix', req.user.id, tributeId, { remixType });
  res.json({ status: 'Remix triggered' });
});

export default router;
