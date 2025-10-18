import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const events = await prisma.ledgerEvent.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
  });
  res.status(200).json(events);
}
