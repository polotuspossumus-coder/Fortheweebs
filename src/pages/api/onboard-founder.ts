import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, email } = req.body;

  // Save to database (mocked)
  console.log(`Founder onboarded: ${name} (${email})`);

  const profile = {
    name,
    email,
    role: 'founder',
    nda_signed: true,
    access: ['admin', 'governance', 'innovation'],
    perks: ['early-modules', 'incentives', 'sovereign-votes'],
  };

  res.status(200).json({ message: `Welcome ${name}, your founder access is now active.` });
}
