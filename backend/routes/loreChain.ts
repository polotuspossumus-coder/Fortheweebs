import { Router } from 'express';
import { renderLoreChain } from '../utils/renderLoreChain';

const router = Router();

router.get('/lore-chain', (req, res) => {
  res.json(renderLoreChain());
});

export default router;
