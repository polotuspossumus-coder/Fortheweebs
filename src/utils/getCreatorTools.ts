// Returns enabled creator tools for a given user tier
export const getCreatorTools = (tier: string) => {
  const registry = {
    'Canvas Forge': ['Supporter Creator', 'Legacy Creator', 'Standard Founder', 'Mythic Founder'],
    'Sound Forge': ['Legacy Creator', 'Standard Founder', 'Mythic Founder'],
    'Video Forge': ['Legacy Creator', 'Standard Founder', 'Mythic Founder'],
    'CGI Generator': ['Standard Founder', 'Mythic Founder'],
    'Analytics Panel': ['Supporter Creator', 'Legacy Creator', 'Standard Founder', 'Mythic Founder'],
    'Campaign Triggers': ['Legacy Creator', 'Standard Founder', 'Mythic Founder'],
    'Artifact Monetization': ['Legacy Creator', 'Standard Founder', 'Mythic Founder'],
    'Moderation Logs': ['Mythic Founder'],
  };
  return Object.entries(registry)
    .filter(([_, tiers]) => tiers.includes(tier))
    .map(([tool]) => tool);
};
