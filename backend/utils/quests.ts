type Quest = {
  id: string;
  name: string;
  description: string;
  reward: string;
  completedBy: string[];
};

const quests: Quest[] = [
  {
    id: 'q1',
    name: 'Ignite the Chain',
    description: 'Claim your first incentive tier.',
    reward: 'Founders Badge',
    completedBy: [],
  },
  {
    id: 'q2',
    name: 'Summon a Referral',
    description: 'Invite another creator using your code.',
    reward: 'Referral Echo Token',
    completedBy: [],
  },
];

export function completeQuest(questId: string, wallet: string) {
  const quest = quests.find(q => q.id === questId);
  if (quest && !quest.completedBy.includes(wallet)) {
    quest.completedBy.push(wallet);
    return { success: true, reward: quest.reward };
  }
  return { success: false };
}

export function getQuests() {
  return quests;
}
