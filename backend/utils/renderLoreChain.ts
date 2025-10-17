import { getValidatorLog } from './validatorMemory';

export function renderLoreChain() {
  const log = getValidatorLog();

  return log.map(({ wallet, tier, timestamp }, i) => {
    const ordinal = i + 1;
    const myth = {
      Founders: `🔥 #${ordinal} ignited the chain as a Founder.`,
      Supporter: `🌱 #${ordinal} nurtured the roots.`,
      Crew: `⚙️ #${ordinal} joined the backstage build.`,
      'Adult Access': `🔓 #${ordinal} unlocked the ritual gate.`,
    }[tier] || `🌀 #${ordinal} joined as ${tier}`;

    return {
      wallet,
      tier,
      timestamp,
      myth,
    };
  });
}
