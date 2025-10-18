import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lore } = req.body;

  // Mocked AI critique logic
  const feedback = `
✅ Mythic tone: Strong use of symbolic language and ritual motifs.
🧬 Remix potential: High — references to shrinewave and mecha lineage are remixable.
⚖️ Governance fit: Suitable for validator memory logging and ritual spawning.
🧠 Suggestions: Clarify the final stanza, consider adding a remix hook or visual artifact.
`;

  res.status(200).json({ feedback });
}
