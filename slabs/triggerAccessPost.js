import { launchCampaign } from './ocoyaCampaign.js';
import { logToLedger } from '../src/utils/logEvent.js';
import { getProfitShare } from './profitShareUtil.js';

/**
 * Triggers an adult access campaign post for a user and logs the event to the ledger.
 * @param {Object} user - The user object with at least `name` and `id`.
 */
export async function triggerAccessPost(user) {
  // user.entryAmount (number) and user.placement (number, optional) expected
  const profitShare = getProfitShare(user.entryAmount, user.placement);
  const payload = {
    title: `🔓 ${user.name} unlocked Fortheweebs adult access`,
    content: `${user.name} joined with a $${user.entryAmount} entry and $5/month subscription. Profit share: ${profitShare}. Legacy begins.`,
    platforms: ['twitter']
  };

  const result = await launchCampaign(payload);
  logToLedger({
    type: 'campaign',
    creatorId: user.id,
    campaignId: result.id,
    timestamp: Date.now(),
    ritual: 'adult-access-initiation',
    profitShare
  });
}
