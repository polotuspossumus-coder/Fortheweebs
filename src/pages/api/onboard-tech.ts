import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, email } = req.body;

  // Save to database (mocked)
  console.log(`Tech crew onboarded: ${name} (${email})`);

  const profile = {
    name,
    email,
    role: 'tech',
    nda_signed: true,
    access: ['admin', 'validator', 'analytics'],
    perks: ['ritual-control', 'lore-approval', 'ops-integration'],
  };

  res.status(200).json({ message: `Welcome ${name}, backstage access is now active.` });
}
