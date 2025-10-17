type Ritual = {
  name: string;
  trigger: 'onClaim' | 'onReferral' | 'onMilestone';
  action: (data: any) => void;
};

const rituals: Ritual[] = [
  {
    name: 'FoundersFlame',
    trigger: 'onClaim',
    action: ({ tier, wallet }) => {
      if (tier === 'Founders') {
        console.log(`🔥 Ritual: FoundersFlame ignited for ${wallet}`);
        // Optional: mint badge, log to lore chain, notify Discord
      }
    },
  },
  {
    name: 'ReferralEcho',
    trigger: 'onReferral',
    action: ({ referralCode, wallet }) => {
      console.log(`🔁 Ritual: ReferralEcho for ${wallet} via ${referralCode}`);
    },
  },
];

export function triggerRitual(trigger: Ritual['trigger'], data: any) {
  rituals
    .filter(r => r.trigger === trigger)
    .forEach(r => r.action(data));
}
