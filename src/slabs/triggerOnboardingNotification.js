import { notifyOnboardingComplete } from '../utils/notify';

export async function triggerOnboardingNotification(user) {
  await notifyOnboardingComplete(user);
}
