import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ref } = req.query;

  // Log referral click (mocked)
  console.log(`Referral click tracked for: ${ref}`);

  res.status(200).json({ message: `Referral ${ref} logged.` });
}
