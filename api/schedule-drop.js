// Vercel serverless API for scheduling artifact/media drops
import { MongoClient } from 'mongodb';

let client;
let db;
let drops;

async function connect(req) {
  if (!client) {
    const uri = (req.env && req.env.MONGO_URI) || undefined;
    if (!uri) throw new Error('MONGO_URI not set');
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    drops = db.collection('scheduledDrops');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect(req);
    const { title, tier, unlockAt, content } = req.body;
    if (!title || !tier || !unlockAt || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const drop = {
      title,
      tierGate: tier, // e.g., 'Mythic Founder', 'Legacy Creator'
      unlockAt: new Date(unlockAt),
      content,
      status: 'scheduled',
      createdAt: new Date(),
    };
    await drops.insertOne(drop);
    res.status(201).json({ status: 'dropScheduled', title, unlockAt });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
