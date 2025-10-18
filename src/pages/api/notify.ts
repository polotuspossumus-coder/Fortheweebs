// pages/api/notify.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, message } = JSON.parse(req.body);
    // TODO: Integrate with notification service or database
    console.log(`Notify user ${userId}: ${message}`);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid request', details: err.message });
  }
}
