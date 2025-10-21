// aiCouncil.ts
// @ts-ignore
import { tierConfig } from './tierAccess.js';
// @ts-ignore
import type { Media, ModerationFlag } from './types/moderation.js';

export function enforceTierAccess(userTier: string, tool: string): boolean {
  const allowed = tierConfig[userTier]?.tools || [];
  return allowed.includes('all-tools') || allowed.includes(tool);
}

export function flagContent(content: Media): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  if (detectNudity(content)) flags.push({ type: 'adult', action: 'access-separation' });
  if (detectIllegal(content)) flags.push({ type: 'illegal', action: 'seal-and-review' });
  return flags;
}
