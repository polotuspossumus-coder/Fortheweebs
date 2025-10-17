import express from 'express';
import { ValidatorLog } from '../models/ValidatorLog';

const router = express.Router();

router.post('/log-action', async (req, res) => {
  try {
    const log = new ValidatorLog(req.body);
    await log.save();
    res.status(200).json({ message: 'Action logged successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logging failed', error: err });
  }
});

export default router;
