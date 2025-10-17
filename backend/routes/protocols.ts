import { Router } from 'express';
import { listProtocols } from '../utils/protocolRegistry';

const router = Router();

router.get('/protocols', (req, res) => {
  res.json(listProtocols());
});

export default router;
