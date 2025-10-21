// exportVideo.ts
// @ts-ignore
import { logArtifactDrop } from './artifactLogger.js';

export async function exportVideo(timeline: any, format: 'mp4' | 'mov', userId: string) {
  const timestamp = new Date();
  const legacyId = `VID-${userId}-${format}-${timestamp.getTime()}`;
  const rendered = await renderTimeline(timeline, format);

  logArtifactDrop(userId, format, timestamp);
  downloadBlob(rendered, `${legacyId}.${format}`);
}
