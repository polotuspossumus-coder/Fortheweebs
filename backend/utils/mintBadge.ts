type BadgeMetadata = {
  wallet: string;
  tier: string;
  image: string;
  description: string;
};

export function mintBadge({ wallet, tier, image, description }: BadgeMetadata) {
  const metadata = {
    name: `${tier} Badge`,
    description,
    image,
    attributes: [{ trait_type: 'Tier', value: tier }],
  };

  console.log(`🪙 Minting badge for ${wallet}:`, metadata);
  // Optional: integrate with NFT service (thirdweb, Alchemy, custom contract)
}
