import { launchCampaign } from './ocoyaCampaign.js';
import { logToLedger } from '../src/utils/logEvent.js';

/**
 * Triggers a campaign post for a new influencer and logs the event to the ledger.
 * @param {Object} influencer - The influencer object with at least `name` and `id`.
 */
export async function triggerInfluencerPost(influencer) {
  const payload = {
    title: `🔥 ${influencer.name} just joined Fortheweebs as a mythic influencer!`,
    content: `${influencer.name} unlocked priority placement and sovereign perks. Follow the legacy.`,
    platforms: ['twitter', 'instagram', 'tiktok']
  };

  const result = await launchCampaign(payload);
  logToLedger({
    type: 'campaign',
    creatorId: influencer.id,
    campaignId: result.id,
    timestamp: Date.now(),
    ritual: 'influencer-onboarding'
  });
}
