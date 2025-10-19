// pages/api/schedule-ritual.ts
// ...existing code...

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { title, datetime } = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};

    // Save to database (mocked here)
    const ritualId = `ritual_${Date.now()}`;
    console.log(`Scheduled Ritual: ${title} at ${datetime}`);

    // Log validator memory
    console.log(`Validator Log: Ritual "${title}" scheduled by Jacob`);

    // Notify creators (mocked)
    console.log(`Notification: All creators invited to "${title}" on ${datetime}`);

    res.status(200).json({ message: `Ritual "${title}" scheduled for ${datetime}` });
  } catch (err) {
    res.status(400).json({ error: 'Invalid request', details: (err as Error).message });
  }
}
