const tiers = {
  mythicFounder: {
    payment: 200,
    perks: ['founderStatus', 'cgiAccess', 'ritualAccess'],
    profitShare: 100,
    flags: {
      isFounder: true,
      hasCGIAccess: true,
      ritualUnlocked: true,
      profitSharePercent: 100,
      badge: 'mythicGlow',
      ledgerEntry: 'founder_immortalized',
    },
    cap: 200,
  },
  standardFounder: {
    payment: 100,
    addOn: 100,
    perks: ['founderStatus', 'cgiAccess', 'ritualAccess'],
    profitShare: 100,
    flags: {
      isFounder: true,
      hasCGIAccess: true,
      ritualUnlocked: true,
      profitSharePercent: 100,
      badge: 'standardGlow',
      ledgerEntry: 'founder_registered',
    },
  },
  legacyCreator: {
    payment: 100,
    perks: ['creatorAccess'],
    profitShare: 95,
    flags: {
      isFounder: false,
      hasCGIAccess: false,
      ritualUnlocked: false,
      profitSharePercent: 95,
    },
  },
  supporterCreator: {
    payment: 50,
    perks: ['adultAccess'],
    profitShare: 85,
    flags: {
      isFounder: false,
      hasCGIAccess: false,
      ritualUnlocked: false,
      profitSharePercent: 85,
    },
  },
  generalAccess: {
    payment: 15,
    subscription: 5,
    perks: ['adultAccess'],
    profitShare: 80,
    flags: {
      isFounder: false,
      hasCGIAccess: false,
      ritualUnlocked: false,
      profitSharePercent: 80,
    },
  },
  // New $200 tier for additional features
  sovereignElite: {
    payment: 200,
    perks: ['eliteStatus', 'cgiAccess', 'ritualAccess', 'campaignAccess'],
    profitShare: 100,
    flags: {
      isFounder: true,
      hasCGIAccess: true,
      ritualUnlocked: true,
      profitSharePercent: 100,
      badge: 'eliteGlow',
      ledgerEntry: 'elite_immortalized',
      campaignUnlocked: true,
    },
    cap: 100,
  },
};

export default tiers;
