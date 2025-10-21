import { MongoClient } from 'mongodb';
import crypto from 'crypto';

// Vercel serverless: avoid process.env, use req.env
let client;
let db;
let graveyard;
let fingerprints;

async function connect(req) {
  if (!client) {
    const uri = (req.env && req.env.MONGO_URI) || undefined;
    if (!uri) throw new Error('MONGO_URI not set');
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    graveyard = db.collection('graveyard');
    fingerprints = db.collection('fingerprints');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect(req);
    const { artifactId } = req.body;
    if (!artifactId) return res.status(400).json({ error: 'Missing artifactId' });
    const artifact = await graveyard.findOne({ _id: artifactId });
    if (!artifact || !artifact.sealed) throw new Error('Artifact not sealed or missing');

    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(artifact.metadata))
      .digest('hex');

    const fingerprint = {
      artifactId,
      hash,
      metadata: artifact.metadata,
      timestamp: new Date(),
      status: 'queuedForReview',
      reviewed: false,
      reviewer: null,
    };

    await fingerprints.insertOne(fingerprint);
    res.status(200).json({ artifactId, hash, status: 'fingerprinted' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
