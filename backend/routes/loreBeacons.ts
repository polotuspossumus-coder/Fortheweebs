import { Router } from 'express';
import { listBeacons, publishBeacon } from '../utils/loreBeacon';

const router = Router();

router.get('/lore-beacons', (req, res) => {
  res.json({ beacons: listBeacons() });
});

router.post('/lore-beacons/publish', (req, res) => {
  const { title, lore, author } = req.body;
  const beacon = publishBeacon(title, lore, author);
  res.json({ success: true, beacon });
});

export default router;
