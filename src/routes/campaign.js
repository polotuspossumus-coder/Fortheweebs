import express from 'express';
import { requireRole } from '../utils/requireRole.js';
import { logLedger } from '../utils/ledger.js';

const router = express.Router();
let campaigns = [];

router.post('/', requireRole('creator'), (req, res) => {
  const { title, description, unlockTier } = req.body;
  const campaign = {
    id: campaigns.length + 1,
    title,
    description,
    unlockTier,
    metrics: { views: 0, contributions: 0 },
    status: 'active',
  };
  campaigns.push(campaign);
  logLedger('campaign_created', req.user.id, campaign.id, { title });
  res.json(campaign);
});

router.get('/:id/metrics', requireRole('any'), (req, res) => {
  const { id } = req.params;
  const campaign = campaigns.find(c => c.id === parseInt(id));
  if (!campaign) return res.status(404).send('Not found');

  campaign.metrics.views += 1;
  res.json(campaign.metrics);
});

router.post('/:id/contribute', requireRole('creator'), (req, res) => {
  const { id } = req.params;
  const campaign = campaigns.find(c => c.id === parseInt(id));
  if (!campaign) return res.status(404).send('Not found');

  campaign.metrics.contributions += 1;
  logLedger('campaign_contribution', req.user.id, id, {});
  res.json({ status: 'Contribution recorded' });
});

export default router;
