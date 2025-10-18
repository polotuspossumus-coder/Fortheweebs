import { prisma } from '../lib/prisma';

/**
 * Logs a ledger event for a user.
 * @param {string} userId - The user's ID.
 * @param {object} event - The event payload (will be stored as JSON).
 * @param {string} [type='onboarding'] - The event type (default: 'onboarding').
 */
export async function updateLedger(userId, event, type = 'onboarding') {
  return prisma.ledgerEvent.create({
    data: {
      userId,
      type,
      payload: event,
    },
  });
}
