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

async function getUserTier(db, userId) {
  const users = db.collection('users');
  const user = await users.findOne({ _id: typeof userId === 'string' ? new ObjectId(userId) : userId });
  return user?.tier || 'Unknown';
}

function getProfitRetention(tier) {
  const tierMap = {
    'Mythic Founder': 1.0,
    'Standard Founder': 1.0,
    'Legacy Creator': 0.95,
    'Supporter Creator': 0.85,
    'General Access': 0.80,
  };
  return tierMap[tier] || 0.80;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { userId, source, amount, artifacts } = req.body;
  if (!userId || !source || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const { db } = await getDb();
  const payouts = db.collection('payouts');
  const earningsLedger = db.collection('creatorEarnings');

  const payout = {
    userId: typeof userId === 'string' ? new ObjectId(userId) : userId,
    source,
    amount,
    artifacts,
    timestamp: new Date(),
  };

  await payouts.insertOne(payout);

  const tier = await getUserTier(db, userId);
  const profitRetention = getProfitRetention(tier);

  await earningsLedger.insertOne({
    ...payout,
    tier,
    profitRetention,
    synced: true,
  });

  res.status(200).json({ status: 'earningsLogged', amount });
}
