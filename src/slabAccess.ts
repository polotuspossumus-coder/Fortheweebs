export function hasPostLaunchAccess(userTier: number): boolean {
  return userTier === 200;
}

export const featureRegistry = {
  preLaunch: [
    "dashboard",
    "graveyard",
    "PR_automation",
    "sovereign_access"
  ],
  postLaunch: [
    "script_generator",
    "audio_companion",
    "fan_signal_expansion",
    "ritual_mirroring"
  ]
};

export function getAvailableFeatures(userTier: number): string[] {
  const baseFeatures = featureRegistry.preLaunch;
  const postLaunchFeatures = hasPostLaunchAccess(userTier)
    ? featureRegistry.postLaunch
    : [];
  return [...baseFeatures, ...postLaunchFeatures];
}

export function canUseFeature(userTier: number, feature: string): boolean {
  return getAvailableFeatures(userTier).includes(feature);
}
