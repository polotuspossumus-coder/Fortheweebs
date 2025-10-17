import { triggerRitual } from '../utils/ritualEngine';

import express from 'express';
import { IncentiveLog } from '../models/IncentiveLog';
import { logValidatorClaim } from '../utils/validatorLog';
import { getLocalizedTiers } from '../utils/tierTranslations';

const router = express.Router();
router.get('/incentives/localized', (req, res) => {
  const locale = req.query.lang as any || 'en';
  const tiers = getLocalizedTiers(locale);
  res.json({ tiers });
});

let first25Claimed = 0;
const FIRST_25_LIMIT = 25;

router.get('/incentives', (req, res) => {
  const tiers = [
    {
      payment: 100,
      profit: first25Claimed < FIRST_25_LIMIT ? 100 : 95,
      slotsRemaining: FIRST_25_LIMIT - first25Claimed,
      tier: first25Claimed < FIRST_25_LIMIT ? 'Founders (100%)' : 'Standard (95%)',
    },
    { payment: 50, profit: 85, tier: 'Supporter' },
    { payment: 25, profit: 50, tier: 'Crew' },
    { payment: 15, subscription: 5, profit: 25, tier: 'Adult Access' },
  ];
  res.json({ tiers });
});

router.post('/incentives/claim', (req, res) => {
  const { payment, wallet, referralCode } = req.body;

  let tier = '';
  let profit = 0;

  if (payment === 100 && first25Claimed < FIRST_25_LIMIT) {
    first25Claimed++;
    tier = 'Founders';
    profit = 100;
  } else if (payment === 100) {
    tier = 'Standard';
    profit = 95;
  } else if (payment === 50) {
    tier = 'Supporter';
    profit = 85;
  } else if (payment === 25) {
    tier = 'Crew';
    profit = 50;
  } else if (payment === 15) {
    tier = 'Adult Access';
    profit = 25;
  } else {
    return res.status(400).json({ success: false, message: 'Invalid payment amount' });
  }

  logValidatorClaim({ wallet, tier, referralCode });
  triggerRitual('onClaim', { tier, wallet });
  if (referralCode) triggerRitual('onReferral', { referralCode, wallet });
  return res.json({ success: true, profit, tier });
});

router.post('/incentives', async (req, res) => {
  try {
    const log = new IncentiveLog(req.body);
    await log.save();
    res.status(200).json({ message: 'Incentive logged' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to log incentive', error: err });
  }
});

export default router;
