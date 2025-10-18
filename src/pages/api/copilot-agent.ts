import { NextApiRequest, NextApiResponse } from 'next';
import { CopilotAgent } from '../../lib/copilot-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action, payload } = req.body;

  if (action === 'summon') {
    return res.status(200).json({ message: CopilotAgent.summon(payload.context) });
  }

  if (action === 'critique') {
    return res.status(200).json({ feedback: CopilotAgent.critiqueLore(payload.text) });
  }

  if (action === 'ritual') {
    return res.status(200).json({ suggestion: CopilotAgent.suggestRitual(payload.lineage) });
  }

  res.status(400).json({ error: 'Unknown action' });
}
