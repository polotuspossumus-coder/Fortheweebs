// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const sampleArtifacts = [
  { id: 1, name: 'Genesis Protocol', description: 'Origin artifact of mythic governance.' },
  { id: 2, name: 'Remix Badge', description: 'Badge for remix lineage tracking.' },
  { id: 3, name: 'Validator Ledger', description: 'Memory log for validators.' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query' });
  }
  const results = sampleArtifacts.filter(a =>
    a.name.toLowerCase().includes(q.toLowerCase()) ||
    a.description.toLowerCase().includes(q.toLowerCase())
  );
  res.status(200).json({ results });
}
