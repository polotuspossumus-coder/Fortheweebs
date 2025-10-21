// legacySync.ts
// @ts-ignore
import { generateFingerprint } from './artifactLogger.js';
// @ts-ignore
import { saveToLedger } from './ArtifactLedger.js';

export function logArtifactDrop(userId: string, tool: string, timestamp: Date) {
  const legacyId = `ART-${userId}-${tool}-${timestamp.getTime()}`;
  const artifact = {
    userId,
    tool,
    timestamp,
    legacyId,
    fingerprint: generateFingerprint(tool, userId, timestamp),
  };
  saveToLedger(artifact);
}
