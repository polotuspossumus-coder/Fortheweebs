// Tier definitions
const tierAccess = {
  mythic: ['canvas', 'cgi', 'sound', 'video', 'metadata'],
  standard: ['canvas', 'cgi', 'sound', 'video'],
  legacy: ['canvas', 'sound'],
  supporter: ['canvas'],
  general: ['basic']
};

// Check unlocked tools for a given tier
function getUnlockedModules(tier) {
  return tierAccess[tier.toLowerCase()] || ['basic'];
}

export { getUnlockedModules };
