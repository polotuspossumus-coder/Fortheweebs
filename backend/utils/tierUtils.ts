export type Tier =
  | 'Founders'
  | 'Creators'
  | 'Contributors'
  | 'Users'
  | 'Adult Access'
  | 'Free';

export const tierOrder: Tier[] = [
  'Free',
  'Adult Access',
  'Users',
  'Contributors',
  'Creators',
  'Founders',
];

export function upgradeTier(current: Tier): Tier | null {
  const index = tierOrder.indexOf(current);
  if (index === -1 || index === tierOrder.length - 1) return null;
  return tierOrder[index + 1];
}

export function getTierWeight(tier: Tier): number {
  return {
    'Founders': 6,
    'Creators': 5,
    'Contributors': 4,
    'Users': 3,
    'Adult Access': 2,
    'Free': 1,
  }[tier];
}

export function getTierLore(tier: Tier): string {
  return {
    'Founders': '🔥 Chain igniters and sovereign architects.',
    'Creators': '🎨 Lore weavers and ritual engineers.',
    'Contributors': '🔧 Builders of backstage infrastructure.',
    'Users': '🌀 Active validators and ritual participants.',
    'Adult Access': '🔓 Gatekeepers of mature content.',
    'Free': '🌍 Observers and passive lore readers.',
  }[tier];
}
