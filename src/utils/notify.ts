/**
 * Sends a notification to a user based on type.
 * @param userId - The user ID to notify
 * @param type - The type of notification (e.g., 'founderDrop', 'legacySync')
 */
export function notify(userId: string, type: string) {
  const messages: Record<string, string> = {
    founderDrop: '🔥 A new founder has joined!',
    legacySync: '📜 Your profile is sealed!',
  };
  send(userId, messages[type]);
}

// Placeholder for send function
function send(userId: string, message?: string) {
  // TODO: Implement actual notification logic
  if (message) {
    console.log(`Notify ${userId}: ${message}`);
  }
}
