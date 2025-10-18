
import { logger } from '../utils/logger';
import { updateLedger, updateMemory } from './ledger.js';

export async function finalizeOnboarding(user) {
  try {
    logger.info('Starting onboarding', { userId: user.id });

    await updateLedger(user.id, { event: 'onboarding' });
    await updateMemory(user.id, { role: 'creator' });

    logger.info('Onboarding complete', { userId: user.id });
    return { success: true };
  } catch (error) {
    logger.error('Onboarding failed', { userId: user.id, error });
    return { success: false, error: error.message };
  }
}
