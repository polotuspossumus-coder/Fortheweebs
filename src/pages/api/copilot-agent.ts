import { NextApiRequest, NextApiResponse } from 'next';
import { runCopilotAgent } from '../../../lib/copilot-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action, payload } = req.body;

  if (action === 'summon') {
    return res.status(200).json({ message: runCopilotAgent(payload.context) });
  }

  if (action === 'critique') {
     const feedback = await runCopilotAgent(payload.text);
     return res.status(200).json({ feedback });
  }

  if (action === 'ritual') {
     // If you need to support suggestRitual, implement it in copilot-agent and import it explicitly.
  }

  res.status(400).json({ error: 'Unknown action' });
}
