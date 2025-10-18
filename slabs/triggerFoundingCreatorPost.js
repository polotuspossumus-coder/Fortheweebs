import { launchCampaign } from './ocoyaCampaign.js';
import { logToLedger } from '../src/utils/logEvent.js';

/**
 * Triggers a campaign post for a new Founding Creator and logs the event to the ledger.
 * @param {Object} creator - The creator object with at least `name` and `id`.
 */
export async function triggerFoundingCreatorPost(creator) {
  const payload = {
    title: `🌟 ${creator.name} is now a Founding Creator of Fortheweebs`,
    content: `${creator.name} unlocked cosmetic status, priority placement, and eternal legacy. The myth begins.`,
    platforms: ['instagram', 'twitter']
  };

  const result = await launchCampaign(payload);
  logToLedger({
    type: 'campaign',
    creatorId: creator.id,
    campaignId: result.id,
    timestamp: Date.now(),
    ritual: 'founding-creator-initiation'
  });
}
