import express from 'express';
import { requireRole } from '../utils/requireRole.js';
import { logLedger } from '../utils/ledger.js';

const router = express.Router();
let proposals = [];

router.post('/', requireRole('creator'), (req, res) => {
  const { title, description } = req.body;
  const proposal = {
    id: proposals.length + 1,
    title,
    description,
    status: 'active',
    votes: [],
    createdBy: req.user.id,
  };
  proposals.push(proposal);
  logLedger('proposal_created', req.user.id, proposal.id, { title });
  res.json(proposal);
});

router.post('/:id/vote', requireRole('any'), (req, res) => {
  const { id } = req.params;
  const { vote } = req.body;
  const proposal = proposals.find(p => p.id === parseInt(id));
  if (!proposal || proposal.status !== 'active') return res.status(404).send('Not found');

  proposal.votes.push({ userId: req.user.id, vote });
  logLedger('vote_cast', req.user.id, id, { vote });
  res.json({ status: 'Vote recorded' });
});

router.post('/:id/resolve', requireRole('jacob'), (req, res) => {
  const { id } = req.params;
  const proposal = proposals.find(p => p.id === parseInt(id));
  if (!proposal) return res.status(404).send('Not found');

  proposal.status = 'resolved';
  logLedger('proposal_resolved', req.user.id, id, {});
  res.json({ status: 'Proposal resolved' });
});

export default router;
