// Vercel serverless API for submitting council verdicts
import { MongoClient, ObjectId } from 'mongodb';

let client;
let db;
let proposals;
let ledger;

async function connect(req) {
  if (!client) {
    const uri = (req.env && req.env.MONGO_URI) || undefined;
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
    await connect(req);
    const { proposalId, verdict } = req.body;
    if (!proposalId || !verdict) return res.status(400).json({ error: 'Missing proposalId or verdict' });
    const id = typeof proposalId === 'string' ? new ObjectId(proposalId) : proposalId;
    const result = await proposals.updateOne(
      { _id: id },
      { $set: { verdict, reviewed: true, reviewedAt: new Date() } }
    );
    if (result.modifiedCount === 0) return res.status(404).json({ error: 'Proposal not found' });
    await ledger.insertOne({
      proposalId: id,
      verdict,
      timestamp: new Date(),
      synced: true,
    });
    res.status(200).json({ status: 'verdictLogged' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
