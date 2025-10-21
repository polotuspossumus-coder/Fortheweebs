import { MongoClient } from 'mongodb';

// Vercel sometimes does not inject process.env in edge/serverless, so fallback
// Vercel edge/serverless: avoid process/env/require, use only runtime-injected env
const uri = req.env && req.env.MONGO_URI ? req.env.MONGO_URI : undefined;
let client;
let db;
let users;
let upgrades;
let client;
let db;
let users;
let upgrades;

async function connect() {
async function connect(req) {
  if (!client) {
    // Try to get env from Vercel runtime (req.env) or fail
    uri = (req.env && req.env.MONGO_URI) || undefined;
    if (!uri) throw new Error('MONGO_URI not set');
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    users = db.collection('users');
    upgrades = db.collection('tierUpgrades');
  }
}

const tierMap = {
  'General Access': { next: 'Supporter Creator', cost: 35, profit: '85%' },
  'Supporter Creator': { next: 'Legacy Creator', cost: 50, profit: '95%' },
  'Legacy Creator': { next: 'Standard Founder', cost: 100, profit: '100%' },
  'Standard Founder': { next: 'Mythic Founder', cost: 0, profit: '100%' }, // Already maxed
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect(req);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const user = await users.findOne({ _id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const currentTier = user.tier;
    const upgrade = tierMap[currentTier];

    if (!upgrade) return res.status(400).json({ error: 'Tier not upgradeable' });

    await upgrades.insertOne({
      userId,
      from: currentTier,
      to: upgrade.next,
      cost: upgrade.cost,
      timestamp: new Date(),
      profitRetention: upgrade.profit,
    });

    await users.updateOne({ _id: userId }, { $set: { tier: upgrade.next } });

    res.status(200).json({ status: 'upgraded', newTier: upgrade.next });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
