import { triggerRitual } from '../utils/ritualEngine';
import { Router } from 'express';

const router = Router();
const referralLog: Record<string, string[]> = {}; // code → [wallets]

router.post('/referrals/claim', (req, res) => {
  const { wallet, referralCode } = req.body;
  if (!wallet || !referralCode) return res.status(400).json({ success: false });

  if (!referralLog[referralCode]) referralLog[referralCode] = [];
  referralLog[referralCode].push(wallet);

  triggerRitual('onReferral', { referralCode, wallet });

  res.json({ success: true, referrals: referralLog[referralCode].length });
});

router.get('/referrals/:code', (req, res) => {
  const code = req.params.code;
  res.json({ wallets: referralLog[code] || [] });
});

export default router;
