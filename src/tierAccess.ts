export enum CreatorTier {
  GENERAL = 'general',
  SUPPORTER = 'supporter',
  LEGACY = 'legacy',
  STANDARD = 'standard',
  MYTHIC = 'mythic',
}

type Tool =
  | 'canvas-basic'
  | 'canvas-full'
  | 'sound-forge'
  | 'prompt-design'
  | 'prompt-track'
  | 'all-tools'
  | 'cgi-tribute'
  | 'future-drops';

type TierConfig = {
  price: number;
  monthly?: number;
  tools: Tool[];
  profitRetention: number;
};

export const tierConfig: Record<CreatorTier, TierConfig> = {
  [CreatorTier.GENERAL]: {
    price: 15,
    monthly: 5,
    tools: ['canvas-basic'],
    profitRetention: 0.8,
  },
  [CreatorTier.SUPPORTER]: {
    price: 50,
    tools: ['canvas-full'],
    profitRetention: 0.85,
  },
  [CreatorTier.LEGACY]: {
    price: 100,
    tools: ['canvas-full', 'sound-forge', 'prompt-design', 'prompt-track'],
    profitRetention: 0.95,
  },
  [CreatorTier.STANDARD]: {
    price: 200,
    tools: ['all-tools'],
    profitRetention: 1.0,
  },
  [CreatorTier.MYTHIC]: {
    price: 200,
    tools: ['all-tools', 'cgi-tribute', 'future-drops'],
    profitRetention: 1.0,
  },
};
