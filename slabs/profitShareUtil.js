/**
 * Determines profit share based on entry amount and placement.
 * @param {number} entryAmount - The entry payment amount (USD).
 * @param {number} placement - The user's placement/order (1-based, for $100 entries).
 * @returns {string} Profit share percentage as a string (e.g., '85%').
 */
/**
 * entryAmount: 0 = free tier, 15 = $15 tier (+$5/mo), 50 = $50, 100 = $100
 */
export function getProfitShare(entryAmount, placement = null) {
  if (entryAmount === 0) return '30%';
  if (entryAmount === 15) return '50%'; // $5/mo required
  if (entryAmount === 50) return '85%';
  if (entryAmount === 100) {
    if (placement !== null && placement <= 25) return '100%';
    return '95%';
  }
  return '0%'; // fallback for unknown cases
}
