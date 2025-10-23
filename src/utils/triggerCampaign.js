function triggerCampaign(userTier, eventType) {
  const campaigns = {
    mythic: ['founderDrop', 'cgiTribute', 'legacySync'],
    standard: ['founderDrop', 'cgiTribute'],
    legacy: ['creatorBoost'],
    supporter: ['supporterShout'],
    general: ['feedPing']
  };
  return campaigns[userTier]?.includes(eventType);
}

export { triggerCampaign };
