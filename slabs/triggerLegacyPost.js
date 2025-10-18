
import { launchCampaign } from './ocoyaCampaign.js';
import { logToLedger } from '../src/utils/logEvent.js';

/**
 * Triggers a legacy post campaign for a new creator and logs the event to the ledger.
 * @param {Object} creator - The creator object with at least `name` and `id`.
 */
export async function triggerLegacyPost(creator) {
  const payload = {
    title: `🎉 ${creator.name} just joined Fortheweebs!`,
    content: `Welcome ${creator.name} to the mythic council. Legacy begins now.`,
    platforms: ['twitter', 'instagram']
  };

  const result = await launchCampaign(payload);
  logToLedger({
    type: 'campaign',
    creatorId: creator.id,
    campaignId: result.id,
    timestamp: Date.now(),
    ritual: 'onboarding-complete'
  });
}
