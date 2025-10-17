import { getValidatorLog } from './validatorMemory';

export function renderRitualSummary() {
  const log = getValidatorLog();
  const summary = {
    Founders: 0,
    Standard: 0,
    Supporter: 0,
    Crew: 0,
    'Adult Access': 0,
  };

  log.forEach(({ tier }) => {
    if (summary[tier] !== undefined) summary[tier]++;
  });

  return Object.entries(summary).map(([tier, count]) => ({
    tier,
    count,
    myth: {
      Founders: '🔥 Chain igniters',
      Standard: '💼 Core validators',
      Supporter: '🌱 Lore nurturers',
      Crew: '⚙️ Ritual builders',
      'Adult Access': '🔓 Gatekeepers',
    }[tier],
  }));
}
