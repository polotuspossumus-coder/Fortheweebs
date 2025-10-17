import { Router } from 'express';

const router = Router();
const creators: any[] = [];

router.post('/onboard', (req, res) => {
  const { name, wallet, language, region, referralCode } = req.body;

  const creator = {
    id: `creator-${Date.now()}`,
    name,
    wallet,
    language,
    region,
    referralCode,
    joinedAt: new Date().toISOString(),
  };

  creators.push(creator);
  res.json({ success: true, creator });
});

router.get('/creators', (req, res) => {
  res.json({ creators });
});

export default router;
