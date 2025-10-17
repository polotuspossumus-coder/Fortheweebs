import express from 'express';
import { AccessTier } from '../models/AccessTier';
import { calculateTier } from '../utils/calculateTier';

const router = express.Router();

router.post('/access', async (req, res) => {
  const { userId, paymentAmount } = req.body;

  const first25Count = await AccessTier.countDocuments({ tier: 'early-100' });
  const { tier, profitShare } = calculateTier(paymentAmount, first25Count);

  if (tier === 'unknown') {
    return res.status(400).json({ message: 'Invalid payment amount' });
  }

  const access = new AccessTier({ userId, paymentAmount, tier, profitShare });
  await access.save();

  res.status(200).json({ message: 'Access granted', tier, profitShare });
});

export default router;
