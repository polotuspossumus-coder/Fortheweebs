// moderationCouncil.ts
// Placeholder for getBanQueue utility
// import type { BanProposal } from './ban-queue.js';
import { banQueue } from './ban-queue.js';

export async function getBanQueue(): Promise<BanProposal[]> {
  // In production, fetch from DB or in-memory queue
  return Promise.resolve(banQueue);
}
