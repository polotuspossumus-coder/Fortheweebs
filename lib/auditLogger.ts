import fs from 'fs';

export function logAudit(action: string, userId: string, meta: object = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    meta,
  };
  fs.appendFileSync('audit.log', JSON.stringify(entry) + '\n');
}
