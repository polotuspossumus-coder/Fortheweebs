// Vercel serverless API to fetch a single artifact by ID
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
    const { artifactId } = req.query;
    if (!artifactId) return res.status(400).json({ error: 'Missing artifactId' });
    const artifact = await vault.findOne({ _id: new ObjectId(artifactId) });
    if (!artifact || artifact.sealed) {
      return res.status(403).json({ error: 'Artifact is sealed or missing' });
    }
    res.status(200).json(artifact);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
