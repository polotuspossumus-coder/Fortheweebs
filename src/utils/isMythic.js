// Returns true if the user is a Mythic tier
import { getUserTier } from './tierLogic.js';

export async function isMythic(userId) {
  const tiers = await getUserTier(userId);
  return Array.isArray(tiers) ? tiers.map(t => t.toLowerCase()).includes('mythic') : false;
}
