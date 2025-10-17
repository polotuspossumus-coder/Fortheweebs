// Fortheweebs v2: Tier Incentive + Ritual Unlock Slab

type Tier =
  | 'Founders'
  | 'Creators'
  | 'Contributors'
  | 'Users'
  | 'Adult Access'
  | 'Free';

type Validator = {
  wallet: string;
  tier: Tier;
  ritualsCompleted: string[];
  badges: string[];
};

type Ritual = {
  id: string;
  name: string;
  description: string;
  requiredTier: Tier;
  rewardBadge: string;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  image: string;
  tier: Tier;
};

const validators: Validator[] = [];
const rituals: Ritual[] = [];
const badges: Badge[] = [];

// === Incentive Logic ===

// Unlock ritual based on tier
export function unlockRitual(wallet: string, ritualId: string) {
  const validator = validators.find(v => v.wallet === wallet);
  const ritual = rituals.find(r => r.id === ritualId);
  if (!validator || !ritual) return { success: false, reason: 'Invalid validator or ritual' };

  const tierIndex = getTierIndex(validator.tier);
  const requiredIndex = getTierIndex(ritual.requiredTier);
  if (tierIndex < requiredIndex) {
    return { success: false, reason: 'Tier too low to unlock ritual' };
  }

  if (!validator.ritualsCompleted.includes(ritual.name)) {
    validator.ritualsCompleted.push(ritual.name);
    validator.badges.push(ritual.rewardBadge);
    return { success: true, reward: ritual.rewardBadge };
  }

  return { success: false, reason: 'Ritual already completed' };
}

// Mint badge
export function mintBadge(name: string, description: string, image: string, tier: Tier) {
  const badge: Badge = {
    id: `badge-${Date.now()}`,
    name,
    description,
    image,
    tier,
  };
  badges.push(badge);
  return badge;
}

// Tier index logic
function getTierIndex(tier: Tier): number {
  return {
    'Free': 0,
    'Adult Access': 1,
    'Users': 2,
    'Contributors': 3,
    'Creators': 4,
    'Founders': 5,
  }[tier];
}

// === Example Ritual Registration ===
export function seedRituals() {
  rituals.push({
    id: 'ritual-flame',
    name: 'Ignite the Chain',
    description: 'First ritual for Founders and Creators.',
    requiredTier: 'Creators',
    rewardBadge: 'Genesis Flame',
  });

  rituals.push({
    id: 'ritual-lore',
    name: 'Publish Lore Beacon',
    description: 'Unlocks lore publishing privileges.',
    requiredTier: 'Contributors',
    rewardBadge: 'Lore Scribe',
  });

  rituals.push({
    id: 'ritual-access',
    name: 'Gatekeeper Ritual',
    description: 'Unlocks mature content moderation.',
    requiredTier: 'Adult Access',
    rewardBadge: 'Gatekeeper Sigil',
  });
}
