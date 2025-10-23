/**
 * Filters events for behavioral flags (e.g., spam, harass).
 * @param events - Array of event strings
 * @returns Array of flagged event strings
 */
export function flagBehavior(events: string[]): string[] {
  return events.filter(e => e.includes('spam') || e.includes('harass'));
}
