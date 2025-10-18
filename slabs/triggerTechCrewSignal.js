import { launchCampaign } from './ocoyaCampaign.js';
import { logToLedger } from '../src/utils/logEvent.js';

/**
 * Triggers a backstage access campaign for a tech crew member and logs the event to the ledger.
 * @param {Object} techCrew - The tech crew object with at least `name` and `id`.
 */
export async function triggerTechCrewSignal(techCrew) {
  const payload = {
    title: `🔧 ${techCrew.name} activated backstage access`,
    content: `Tech crew member ${techCrew.name} is now operating behind the scenes. NDA secured.`,
    platforms: ['twitter']
  };

  const result = await launchCampaign(payload);
  logToLedger({
    type: 'campaign',
    creatorId: techCrew.id,
    campaignId: result.id,
    timestamp: Date.now(),
    ritual: 'techcrew-nda-complete'
  });
}
