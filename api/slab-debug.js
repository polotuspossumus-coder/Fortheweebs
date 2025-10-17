const express = require('express');
const router = express.Router();
const ai = require('../lib/api');

// POST /api/slab-debug
router.post('/', async (req, res) => {
  try {
    const { logic, ui } = req.body;
    const explanation = await ai.explainSlab({ logic, ui });
    res.json(explanation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to debug slab', details: typeof err === 'object' && err !== null && 'message' in err ? err.message : String(err) });
  }
});

module.exports = router;
