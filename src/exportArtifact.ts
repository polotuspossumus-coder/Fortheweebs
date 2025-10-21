// exportArtifact.ts
import { saveAs } from 'file-saver';
// @ts-ignore
import { logArtifactDrop } from './artifactLogger.js';

export function exportArtifact(data: Blob, format: string, userId: string) {
  const timestamp = new Date();
  const legacyId = `ART-${userId}-${format}-${timestamp.getTime()}`;
  logArtifactDrop(userId, format, timestamp);
  saveAs(data, `${legacyId}.${format}`);
}
