import { Router } from 'express';
import { listSlabs, registerSlab } from '../utils/slabIndex';

const router = Router();


router.get('/slabs', (req, res) => {
  let slabs = listSlabs();
  const { category } = req.query;
  if (category) slabs = slabs.filter(s => s.category === category);
  res.json({ slabs });
});

router.post('/slabs/register', (req, res) => {
  const { name, category, linkedProtocols } = req.body;
  const slab = registerSlab(name, category, linkedProtocols);
  res.json({ success: true, slab });
});

export default router;
