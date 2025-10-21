// Fortheweebs Tier Logic & Unlocks
const TIERS = {
  free: {
    price: 0,
    access: [],
    profit: 30,
    moderation: 'heavy'
  },
  general: {
    price: 15,
    monthly: 5,
    access: ['basicPublishing'],
    profit: 50,
    moderation: 'moderate'
  },
  supporter: {
    price: 50,
    access: ['limitedFeatures'],
    profit: 85,
    moderation: 'light',
    upgradeable: true
  },
  legacy: {
    price: 100,
    access: ['allFeaturesExceptCGI', 'futureRituals'],
    profit: 95,
    moderation: 'sovereign'
  },
  standard: {
    price: 100,
    unlock: 100,
    access: ['allFeatures', 'CGI', 'futureRituals'],
    profit: 100,
    moderation: 'sovereign'
  },
  mythic: {
    price: 200,
    access: ['allFeatures', 'CGI', 'futureRituals', 'forever'],
    profit: 100,
    moderation: 'sovereign'
  }
};


function getTierAccess(tier) {
  return TIERS[tier]?.access || [];
}

function getTierProfit(tier) {
  return TIERS[tier]?.profit || 0;
}

function getTierModeration(tier) {
  return TIERS[tier]?.moderation || '';
}

function getTierUnlockedAccess(tier) {
  return TIERS[tier]?.unlockedAccess || [];
}

export { TIERS, getTierAccess, getTierProfit, getTierModeration, getTierUnlockedAccess };
