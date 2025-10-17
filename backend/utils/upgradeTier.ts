type Tier = 'Adult Access' | 'Crew' | 'Supporter' | 'Standard' | 'Founders';

const tierOrder: Tier[] = ['Adult Access', 'Crew', 'Supporter', 'Standard', 'Founders'];

export function upgradeTier(current: Tier): Tier | null {
  const index = tierOrder.indexOf(current);
  if (index === -1 || index === tierOrder.length - 1) return null;
  return tierOrder[index + 1];
}
