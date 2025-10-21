import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEDGER_PATH = path.join(__dirname, '..', '..', 'data', 'ledger.json');

export const logLedger = async (
  actionType,
  actorId,
  targetId,
  metadata
) => {
  const entry = {
    timestamp: new Date().toISOString(),
    actionType,
    actorId,
    targetId,
    metadata,
  };
  const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8'));
  ledger.push(entry);
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
};
