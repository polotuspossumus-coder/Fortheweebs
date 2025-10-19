import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs';
import express from 'express';
import path from 'path';
const app = express();
app.use(express.json());

app.post('/relay-slab', (req, res) => {
  const { filename, code } = req.body;
  const slabsDir = path.join(__dirname, 'slabs');
  if (!fs.existsSync(slabsDir)) {
    fs.mkdirSync(slabsDir);
  }
  const filePath = path.join(slabsDir, filename);
  try {
    fs.writeFileSync(filePath, code);
    console.log(`Slab ${filename} injected.`);
    res.send({ status: 'success' });
  } catch (err) {
    console.error('Error injecting slab:', err);
    res.status(500).send({ status: 'error', error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Relay listener active on port 3000');
});
