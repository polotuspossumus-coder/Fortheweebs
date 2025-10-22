// Placeholder: always returns false (not blocked)
function checkBlockStatus(senderId, receiverId) {
  // TODO: Replace with real block status logic
  return false;
}

function canMessage(senderId, receiverId) {
  const isBlocked = checkBlockStatus(senderId, receiverId);
  return !isBlocked;
}

export { canMessage };
