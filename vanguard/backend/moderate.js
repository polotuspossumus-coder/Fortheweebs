// Vanguard moderation API router
// PATCH /api/vanguard/moderate/:id/status to update file status

const express = require('express');
const router = express.Router();
const path = require('path');
const { Low, JSONFile } = require('lowdb');

const dbFile = path.join(__dirname, '../../../media/vanguard-meta.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await db.read();
  const file = db.data.files.find(f => f.remixId === id || f.fileName === id);
  if (!file) return res.status(404).send({ error: 'File not found' });
  file.status = status;
  await db.write();
  res.send({ success: true });
});

module.exports = router;
