// /api/remix.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { Low, JSONFile } = require('lowdb');

const remixDbFile = path.join(__dirname, '../../../media/vanguard-remixes.json');
const remixAdapter = new JSONFile(remixDbFile);
const remixDb = new Low(remixAdapter);

const validatorDbFile = path.join(__dirname, '../../../media/vanguard-validator-memory.json');
const validatorAdapter = new JSONFile(validatorDbFile);
const validatorDb = new Low(validatorAdapter);

// POST /api/remix - create a remix
router.post('/remix', async (req, res) => {
  const { originalId, userId, changes } = req.body;
  await remixDb.read();
  remixDb.data ||= { remixes: [] };
  const remixId = `remix_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  remixDb.data.remixes.push({ remixId, originalId, userId, changes, timestamp: Date.now() });
  await remixDb.write();
  await validatorDb.read();
  validatorDb.data ||= { actions: [] };
  validatorDb.data.actions.push({ action: 'remix', remixId, userId });
  await validatorDb.write();
  res.json({ remixId });
});

module.exports = router;
