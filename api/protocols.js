const express = require('express');
const router = express.Router();
const db = require('../lib/database');

router.post('/', async (req, res) => {
  try {
    const { name, logic, ui } = req.body;
    await db.protocols.insertOne({ name, logic, ui, createdAt: Date.now() });
    require('../../utils/logger').info('Protocol created', { name });
    res.json({ success: true });
  } catch (err) {
    require('../../utils/logger').error('Protocol creation failed', { error: err });
    res.status(500).json({ error: 'Failed to create protocol.' });
  }
});

module.exports = router;
