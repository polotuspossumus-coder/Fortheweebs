// Vercel serverless API for managing VaultEntry documents
import { MongoClient, ObjectId } from 'mongodb';
import { VaultEntry } from '../src/models/VaultEntry';


let client;
let db;
let vaultEntries;

async function connect(req) {
  if (!client) {
    const uri = (req.env && req.env.MONGO_URI) || undefined;
    if (!uri) throw new Error('MONGO_URI not set');
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('fortheweebs');
    vaultEntries = db.collection('vaultEntries');
  }
}

export default async function handler(req, res) {
  await connect(req);
  if (req.method === 'GET') {
    // List all vault entries for a user
    const { userId } = req.query;
    const entries = await vaultEntries.find({ userId: new ObjectId(userId) }).toArray();
    res.status(200).json(entries);
  } else if (req.method === 'POST') {
    // Create a new vault entry
    const { userId, sealed, unlockAt, metadata } = req.body;
    const entry = new VaultEntry({
      userId: new ObjectId(userId),
      sealed,
      unlockAt: new Date(unlockAt),
      metadata,
    });
    const result = await vaultEntries.insertOne(entry);
    res.status(201).json({ _id: result.insertedId });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
