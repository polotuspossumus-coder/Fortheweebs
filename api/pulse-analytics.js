import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return { db: cachedDb, client: cachedClient };
  const uri = (await import('process')).env.MONGO_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('fortheweebs');
  cachedClient = client;
  cachedDb = db;
  return { db, client };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { db } = await getDb();
  const campaigns = db.collection('campaigns');
  const vault = db.collection('vault');

  const now = new Date();
  const pastWeek = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);

  const campaignStats = await campaigns.aggregate([
    { $match: { timestamp: { $gte: pastWeek }, type: 'legacyPulse' } },
    {
      $group: {
        _id: '$tierGate',
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  const unlockStats = await vault.aggregate([
    { $match: { unlockedAt: { $gte: pastWeek }, sealed: false } },
    {
      $group: {
        _id: '$tierGate',
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  res.status(200).json({ campaignStats, unlockStats });
}
