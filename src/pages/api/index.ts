// pages/api/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

let indexedArtifacts: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const artifact = JSON.parse(req.body);
    indexedArtifacts.push(artifact);
    // TODO: Persist to database or search index
    res.status(200).json({ success: true });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: 'Invalid request', details: err.message });
    } else {
      res.status(400).json({ error: 'Invalid request', details: String(err) });
    }
  }
}
