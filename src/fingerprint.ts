// fingerprint.ts
import crypto from 'crypto';

export function generateFingerprint(tool: string, userId: string, timestamp: Date): string {
  const seed = `${tool}-${userId}-${timestamp.getTime()}`;
  return crypto.createHash('sha256').update(seed).digest('hex');
}
