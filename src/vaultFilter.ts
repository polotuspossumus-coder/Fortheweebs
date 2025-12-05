import { VaultEntry } from './vaultUpload.js';
// Filter VaultEntry[] by format and tier
export function filterVault(
  entries: VaultEntry[],
  options: { format?: VaultEntry['format']; tier?: VaultEntry['tier'] }
): VaultEntry[] {
  return entries.filter(entry => {
    const formatMatch = options.format ? entry.format === options.format : true;
    const tierMatch = options.tier ? entry.tier === options.tier : true;
    return formatMatch && tierMatch;
  });
}

type Asset = {
  id: string | number;
  title: string;
  tier: 'general' | 'supporter' | 'legacy' | 'mythic';
  // Add other fields as needed
};

// @ts-ignore
// @ts-ignore
import { CreatorTier, type Asset } from './tierAccess.js';

export function filterVaultAssets(userTier: CreatorTier, assets: Asset[]): Asset[] {
  return assets.filter(asset => {
    if (asset.tier === 'general') return true;
    if (asset.tier === 'supporter' && userTier !== CreatorTier.GENERAL) return true;
    if (
      asset.tier === 'legacy' &&
      [CreatorTier.LEGACY, CreatorTier.STANDARD, CreatorTier.MYTHIC].includes(userTier)
    )
      return true;
    if (asset.tier === 'mythic' && userTier === CreatorTier.MYTHIC) return true;
    return false;
  });
}
