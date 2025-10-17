// Vanguard API: List all uploaded files (for dashboard display)
const express = require('express');
const router = express.Router();
const path = require('path');
const { Low, JSONFile } = require('lowdb');

const dbFile = path.join(__dirname, '../../../media/vanguard-meta.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.files || []);
});

module.exports = router;
