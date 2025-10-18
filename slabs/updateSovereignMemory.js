// ...existing code...

/**
 * Updates sovereign memory for a user after onboarding.
 * @param {string|number} userId - The user's unique identifier.
 * @param {Object} data - Data to store (role, perks, ritual, etc).
 */
import { logToLedger } from '../src/utils/logEvent.js';

export function updateSovereignMemory(userId, memory) {
  // Inject into sovereign ledger
  logToLedger({
    type: 'memory-update',
    userId,
    ...memory,
    timestamp: Date.now()
  });
}
