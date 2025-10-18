// pages/api/creator-stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Mocked stats for demo purposes
  const stats = {
    uploads: 12,
    remixes: 34,
    ritualsJoined: 5,
    loreApproved: 9,
    profitEarned: '$1,420',
    tier: 'first-25',
    founding_status: true,
    perks: ["badge", "priority-placement", "early-remix-access"],
    role: "tech",
    nda_signed: true,
    access: ["admin", "validator", "analytics"],
    tech_perks: ["ritual-control", "lore-approval", "ops-integration"],
    profit_share: 100,
    influencer_perks: ["featured", "custom-ritual", "analytics", "affiliate"],
  };
  res.status(200).json(stats);
}
