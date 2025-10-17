import { Router } from 'express';
import { getValidatorLog } from '../utils/validatorMemory';

const router = Router();

router.get('/leaderboard', (req, res) => {
  const log = getValidatorLog();
  const leaderboard = log.reduce((acc, { wallet }) => {
    acc[wallet] = (acc[wallet] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .map(([wallet, count]) => ({ wallet, claims: count }));

  res.json({ leaderboard: sorted });
});

export default router;
