// pages/api/onboard-influencer.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { name, handle, email } = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};
    // TODO: Save influencer profile to database
    console.log(`Influencer onboarded: ${name} (${handle}), email: ${email}`);
    res.status(200).json({ message: 'Profile activated! Welcome to Fortheweebs.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid request', details: err.message });
  }
}
