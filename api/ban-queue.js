import { MongoClient } from 'mongodb';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { db } = await getDb();
  const bans = db.collection('banProposals');
  const queue = await bans.find({ reviewed: false }).toArray();
  res.status(200).json(queue);
}
