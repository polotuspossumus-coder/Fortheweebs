import {
  triggerFoundingCreatorPost,
  triggerInfluencerPost,
  triggerTechCrewSignal,
  triggerAccessPost
} from './ritualSlabs.js';

/**
 * Handles onboarding completion by role and triggers the appropriate campaign/ledger automation.
 * @param {Object} user - The user object with at least `role`, `name`, `id`, and payment info.
 */
export function handleOnboardingComplete(user) {
  switch (user.role) {
    case 'founding':
      return triggerFoundingCreatorPost(user);
    case 'influencer':
      return triggerInfluencerPost(user);
    case 'techcrew':
      return triggerTechCrewSignal(user);
    case 'subscriber':
    default:
      return triggerAccessPost(user);
  }
}
