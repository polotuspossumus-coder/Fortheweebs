import { Router } from 'express';
import { getValidatorLog } from '../utils/validatorMemory';

const router = Router();

router.get('/validators', (req, res) => {
  res.json(getValidatorLog());
});

export default router;
