// Vercel serverless API to list unlocked vault artifacts for a user and tier
import { MongoClient, ObjectId } from 'mongodb';

let client;
let db;
let vault;

async function connect(req) {
  if (!client) {
    const uri = (req.env && req.env.MONGO_URI) || undefined;
    if (!uri) throw new Error('MONGO_URI not set');
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    vault = db.collection('vault');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect(req);
    const { userId, tier } = req.query;
    if (!userId || !tier) return res.status(400).json({ error: 'Missing userId or tier' });
    // Only show unlocked artifacts for the user and tier
    let query = { sealed: false };
    if (userId) query.userId = userId;
    if (tier) {
      // If tier is numeric, use $lte; else fallback to $in for string tiers
      const tierNum = Number(tier);
      if (!isNaN(tierNum)) {
        query.tierGate = { $lte: tierNum };
      } else {
        query.tierGate = { $in: [tier, null, undefined] };
      }
    }
    const artifacts = await vault.find(query).sort({ unlockedAt: -1 }).toArray();
    res.status(200).json(artifacts);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
