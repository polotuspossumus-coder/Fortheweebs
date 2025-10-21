// Vercel serverless API to execute scheduled drops
import { MongoClient } from 'mongodb';

let client;
let db;
let drops;
let vault;

async function connect(req) {
  if (!client) {
    const uri = (req.env && req.env.MONGO_URI) || undefined;
    if (!uri) throw new Error('MONGO_URI not set');
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    drops = db.collection('scheduledDrops');
    vault = db.collection('vault');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect(req);
    const now = new Date();
    const readyDrops = await drops.find({ unlockAt: { $lte: now }, status: 'scheduled' }).toArray();
    for (const drop of readyDrops) {
      await vault.insertOne({
        ...drop.content,
        sealed: false,
        unlockedAt: now,
        tierGate: drop.tierGate,
        metadata: {
          title: drop.title,
          dropTimestamp: now,
          ritualTag: 'Scheduled Drop',
        },
      });
      await drops.updateOne({ _id: drop._id }, { $set: { status: 'executed' } });
    }
    res.status(200).json({ executed: readyDrops.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
