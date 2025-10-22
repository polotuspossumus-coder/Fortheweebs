// ban-queue.js
// In-memory ban queue for moderationCouncil

/**
 * @typedef {Object} BanProposal
 * @property {string} id
 * @property {string} reason
 * @property {string} status
 */

/** @type {BanProposal[]} */
export const banQueue = [
  // Example entry
  // { id: 'user1', reason: 'spam', status: 'pending' }
];
