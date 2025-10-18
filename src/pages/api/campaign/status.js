import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const { userId } = req.query;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  res.status(200).json({
    state: user.role === 'creator' ? 'Active' : 'Pending',
    perks: user.perks || [],
    memoryScore: Math.floor(Math.random() * 100), // placeholder
  });
}
