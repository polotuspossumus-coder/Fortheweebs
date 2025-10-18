import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { vote } = req.body;
  // Store vote in governance chain
  console.log('Vote recorded:', vote);
  res.status(200).json({ message: 'Vote recorded in the governance chain.' });
}
