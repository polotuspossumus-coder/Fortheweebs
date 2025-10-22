/**
 * Calculates revenue split for an artifact based on tier and price.
 * @param tier - The artifact tier (mythic, standard, legacy, supporter, general)
 * @param price - The sale price
 * @returns Object with creator and polotus shares
 */
export function monetizeArtifact(tier: string, price: number) {
  const retention: number = { mythic: 1, standard: 1, legacy: 0.95, supporter: 0.85, general: 0.8 }[tier] ?? 0;
  const creator = price * retention;
  const polotus = price - creator;
  return { creator, polotus };
}
