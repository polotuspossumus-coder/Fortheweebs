
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

router.get('/ledger/public', async (req, res) => {
  const filePath = path.join(__dirname, '..', '..', 'data', 'ledger.json');
  let ledger = [];
  if (fs.existsSync(filePath)) {
    ledger = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  res.json(ledger);
});

export default router;
