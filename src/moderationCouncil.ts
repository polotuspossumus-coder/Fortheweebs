// moderationCouncil.ts
// Placeholder for getBanQueue utility
import { BanProposal, banQueue } from './ban-queue.js';

export async function getBanQueue(): Promise<BanProposal[]> {
  // In production, fetch from DB or in-memory queue
  return Promise.resolve(banQueue);
}
