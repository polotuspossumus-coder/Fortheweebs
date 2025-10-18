import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sourceId, title } = req.body;

  // Log fork (mocked)
  console.log(`Remix forked from ${sourceId} into new thread: ${title}`);

  // Optional: log to validator memory
  console.log(`Validator memory updated: Forked remix lineage from ${sourceId} into ${title}`);

  res.status(200).json({ message: `Remix forked successfully into "${title}".` });
}
