const express = require('express');
const fs = require('fs');
const router = express.Router();

// GET /changelog - returns the contents of CHANGELOG.md as markdown
router.get('/changelog', (req, res) => {
  try {
    const log = fs.readFileSync('./CHANGELOG.md', 'utf-8');
    require('../../utils/logger').info('Changelog served');
    res.type('text/markdown').send(log);
  } catch (err) {
    require('../../utils/logger').error('Changelog fetch failed', { error: err });
    res.status(500).send('# Changelog not available');
  }
});

module.exports = router;
