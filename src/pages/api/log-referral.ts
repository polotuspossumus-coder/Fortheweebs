import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { referrerCode, newUser } = req.body;

  // Log referral lineage (mocked)
  console.log(`Referral: ${newUser} joined via ${referrerCode}`);

  // Optional: trigger remix perk or governance vote
  console.log(`Perk granted to ${referrerCode} for referring ${newUser}`);

  res.status(200).json({ message: `Referral logged for ${referrerCode}` });
}
