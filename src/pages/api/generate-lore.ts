// pages/api/generate-lore.ts
// ...existing code...

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { theme } = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};
    const lore = `In the realm of ${theme}, creators forge rituals beneath neon moons...`;
    res.status(200).json({ lore });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: 'Invalid request', details: err.message });
    } else {
      res.status(400).json({ error: 'Invalid request', details: String(err) });
    }
  }
}
