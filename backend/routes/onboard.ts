import { Router } from 'express';

const router = Router();

router.get('/onboard', (req, res) => {
  res.json({ message: 'Onboard route active.' });
});

export default router;
