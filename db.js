// Vanguard DB module (LowDB wrapper)
// Provides saveFileMeta and logUserAction for media ingestion

const path = require('path');
const { Low, JSONFile } = require('lowdb');

const dbFile = path.join(__dirname, '../../media/vanguard-meta.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Initialize DB structure
async function init() {
  await db.read();
  db.data ||= { files: [], actions: [] };
  await db.write();
}

// Save file metadata
async function saveFileMeta(meta) {
  await init();
  db.data.files.push(meta);
  await db.write();
}

// Log user action
async function logUserAction(userId, type, description) {
  await init();
  db.data.actions.push({ userId, type, description, timestamp: Date.now() });
  await db.write();
}

module.exports = { saveFileMeta, logUserAction };
