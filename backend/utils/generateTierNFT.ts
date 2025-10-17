export function generateTierNFT(tier: string, wallet: string) {
  return {
    name: `${tier} Validator`,
    description: `This NFT certifies ${wallet} as a ${tier} of Fortheweebs.`,
    image: `https://fortheweebs.com/nft/${tier.toLowerCase()}.png`,
    attributes: [
      { trait_type: 'Tier', value: tier },
      { trait_type: 'Validator', value: wallet },
    ],
  };
}
