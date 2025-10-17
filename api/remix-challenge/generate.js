const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const prompts = [
    'Remix a slab using only emoji UI',
    'Fork a slab with zero endorsements',
    'Create a remix that loops back to its ancestor',
    'Publish a remix with validator lore embedded',
  ];
  const pick = prompts[Math.floor(Math.random() * prompts.length)];
  res.json({ prompt: pick });
});

module.exports = router;
