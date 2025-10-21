
import { MongoClient, ObjectId } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return { db: cachedDb, client: cachedClient };
  // Always use dynamic import for process.env to avoid 'process is not defined' error
  const uri = (await import('process')).env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('fortheweebs');
  cachedClient = client;
  cachedDb = db;
  return { db, client };
}

export default async function overrideModeration(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { artifactId, overrideType, reason } = req.body;

  const validTypes = ['seal', 'unseal', 'banReverse', 'banEnforce'];
  if (!validTypes.includes(overrideType)) {
    return res.status(400).json({ error: 'Invalid override type' });
  }

  const { db } = await getDb();
  const fingerprints = db.collection('fingerprints');
  const overrideLog = db.collection('moderationOverrides');

  await overrideLog.insertOne({
    artifactId: new ObjectId(artifactId),
    overrideType,
    reason,
    timestamp: new Date(),
    executedBy: req.user?.username || 'Jacob',
    synced: true,
  });

  // Optional: apply override directly
  if (overrideType === 'seal') {
    await fingerprints.updateOne({ _id: new ObjectId(artifactId) }, { $set: { sealed: true } });
  } else if (overrideType === 'unseal') {
    await fingerprints.updateOne({ _id: new ObjectId(artifactId) }, { $set: { sealed: false } });
  }

  res.status(200).json({ status: 'overrideExecuted', overrideType });
}
