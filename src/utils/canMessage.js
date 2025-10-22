// Placeholder: always returns false (not blocked)
function checkBlockStatus(senderId, receiverId) {
  // TODO: Replace with real block status logic
  // Use parameters to avoid unused warnings
  return Boolean(senderId) && Boolean(receiverId) ? false : false;
}

function canMessage(senderId, receiverId) {
  const isBlocked = checkBlockStatus(senderId, receiverId);
  return !isBlocked;
}

export { canMessage };
