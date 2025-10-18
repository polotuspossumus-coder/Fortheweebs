import { assignRoleFlags } from './assignRoleFlags.js';
import { handleOnboardingComplete } from './handleOnboarding.js';

export async function finalizeOnboarding(user) {
  const flaggedUser = assignRoleFlags(user);
  await handleOnboardingComplete(flaggedUser);
  return { status: 'ritual-complete', userId: user.id };
}
