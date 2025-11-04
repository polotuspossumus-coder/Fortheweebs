// Assumes sendNotification is imported or defined elsewhere
function notifyUser(userId, eventType) {
  const messages = {
    founderDrop: '🔥 A new founder has joined!',
    cgiTribute: '🎨 Your CGI tribute is live!',
    legacySync: '📜 Your profile has been sealed as legacy!',
    creatorBoost: '🚀 You’ve been featured!',
    supporterShout: '💬 You’ve earned a shoutout!',
    feedPing: '📢 Your post is live!'
  };

  const message = messages[eventType];
  if (message) {
  sendNotification(userId, message);
// --- Stub for missing dependency ---
function sendNotification(userId, message) { void userId; void message; }
  }
}

export { notifyUser };
