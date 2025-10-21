// Vercel serverless API for submitting council verdicts
import { MongoClient, ObjectId } from 'mongodb';

let client;
let db;
let proposals;
let ledger;

async function connect() {
  if (!client) {
    const uri = (await import('process')).env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not set');
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    proposals = db.collection('banProposals');
    ledger = db.collection('banLedger');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect();
    const { banId, verdict } = req.body;
    if (!banId || !verdict) return res.status(400).json({ error: 'Missing banId or verdict' });
    const id = typeof banId === 'string' ? new ObjectId(banId) : banId;
    const result = await proposals.updateOne(
      { _id: id },
      { $set: { verdict, reviewed: true, reviewedAt: new Date() } }
    );
    if (result.modifiedCount === 0) return res.status(404).json({ error: 'Proposal not found' });
    await ledger.insertOne({
      banId: id,
      verdict,
      timestamp: new Date(),
      synced: true,
      reviewedBy: req.user?.username || 'Jacob',
    });
    res.status(200).json({ status: 'verdictLogged' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
