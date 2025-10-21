// Vercel serverless API to list council log/banLedger entries
import { MongoClient } from 'mongodb';

let client;
let db;
let ledger;

async function connect(req) {
  if (!client) {
    const uri = (req.env && req.env.MONGO_URI) || undefined;
    if (!uri) throw new Error('MONGO_URI not set');
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    ledger = db.collection('banLedger');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect(req);
    const logs = await ledger.find({}).sort({ timestamp: -1 }).toArray();
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
