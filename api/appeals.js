import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
let client;
let db;
let appeals;

async function connect() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    appeals = db.collection('appeals');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  await connect();
  const { userId, reason } = req.body;
  const appeal = {
    userId,
    reason,
    timestamp: new Date(),
    status: 'pending',
    reviewedBy: null,
    verdict: null,
    ledgerSync: false,
  };
  await appeals.insertOne(appeal);
  res.status(200).json({ status: 'submitted' });
}
