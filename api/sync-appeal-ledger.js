import { MongoClient, ObjectId } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return { db: cachedDb, client: cachedClient };
  const uri = (await import('process')).env.MONGO_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('fortheweebs');
  cachedClient = client;
  cachedDb = db;
  return { db, client };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { appealId, verdict } = req.body;
  if (!appealId || !verdict) {
    return res.status(400).json({ error: 'Missing appealId or verdict' });
  }
  const { db } = await getDb();
  const appeals = db.collection('appeals');
  const appealLedger = db.collection('appealLedger');

  const appeal = await appeals.findOne({ _id: new ObjectId(appealId) });
  if (!appeal || appeal.status !== 'pending') {
    return res.status(404).json({ error: 'Appeal not found or already reviewed' });
  }

  await appeals.updateOne(
    { _id: new ObjectId(appealId) },
    { $set: { status: 'reviewed', verdict, reviewedAt: new Date(), reviewedBy: req.user?.username || 'Jacob' } }
  );

  await appealLedger.insertOne({
    appealId: new ObjectId(appealId),
    userId: appeal.userId,
    reason: appeal.reason,
    verdict,
    timestamp: new Date(),
    reviewedBy: req.user?.username || 'Jacob',
    synced: true,
  });

  res.status(200).json({ status: 'appealSynced', verdict });
}
