// remixLogger.js
const db = require('../lib/database');

async function logRemix({ userId, originalAsset, changes, outputUrl }) {
  await db.remixes.insertOne({
    userId,
    originalAsset,
    changes,
    outputUrl,
    timestamp: new Date(),
  });
}

module.exports = logRemix;
