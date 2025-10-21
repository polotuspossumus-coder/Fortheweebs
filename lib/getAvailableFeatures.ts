import featureRegistry from './featureRegistry';
import { hasPostLaunchAccess } from './hasPostLaunchAccess';

export function getAvailableFeatures(userTier: number): string[] {
  const baseFeatures = featureRegistry.preLaunch;
  const postLaunchFeatures = hasPostLaunchAccess(userTier)
    ? featureRegistry.postLaunch
    : [];
  return [...baseFeatures, ...postLaunchFeatures];
}
