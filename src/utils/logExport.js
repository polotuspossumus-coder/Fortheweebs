import { getUserTier } from './tierLogic.js';
import { isMythic } from './isMythic.js';

// Async logExport to support async tier checks
export async function logExport(userId, tool, artifact) {
  const tier = await getUserTier(userId);
  const legacySynced = tool === 'cgi' && (await isMythic(userId));
  return {
    userId,
    tool,
    artifact,
    timestamp: Date.now(),
    tier,
    legacySynced
  };
}
