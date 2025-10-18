import {
  triggerFoundingCreatorPost,
  triggerInfluencerPost,
  triggerTechCrewSignal,
  triggerAccessPost
} from './ritualSlabs.js';
import { updateSovereignMemory } from './updateMemory.js';

/**
 * Handles onboarding completion by role, triggers campaign/ledger, and updates sovereign memory.
 * @param {Object} user - The user object with at least `role`, `id`, `perks`, etc.
 */
export async function handleOnboardingComplete(user) {
  switch (user.role) {
    case 'founding':
      await triggerFoundingCreatorPost(user);
      break;
    case 'influencer':
      await triggerInfluencerPost(user);
      break;
    case 'techcrew':
      await triggerTechCrewSignal(user);
      break;
    case 'subscriber':
    default:
      await triggerAccessPost(user);
      break;
  }

  updateSovereignMemory(user.id, {
    role: user.role,
    perks: user.perks,
    ritual: 'onboarding-complete'
  });
}
