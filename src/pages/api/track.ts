// pages/api/track.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path, timestamp } = JSON.parse(req.body);
    // TODO: Store page view in analytics database or log
    console.log('Page view tracked:', { path, timestamp });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid request', details: err.message });
  }
}
