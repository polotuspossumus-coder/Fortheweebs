// Assumes getRecentEvents is imported or defined elsewhere
function generateFeed(userTier, userId) {
  const feedRules = {
    mythic: ['founderDrop', 'cgiTribute', 'legacySync', 'globalShout'],
    standard: ['founderDrop', 'cgiTribute'],
    legacy: ['creatorBoost'],
    supporter: ['supporterShout'],
    general: ['feedPing']
  };

  const events = getRecentEvents(userId);
// --- Stub for missing dependency ---
function getRecentEvents(userId) { void userId; return []; }
  return events.filter(e => feedRules[userTier]?.includes(e.type));
}

export { generateFeed };
