// Utility to block a user by sending their IP and blocked user ID to the backend
export async function blockUser(blockedUserId) {
  const blockerIP = await getUserIP();
  await fetch('/api/block', {
    method: 'POST',
    body: JSON.stringify({ blockerIP, blockedUserId }),
    headers: { 'Content-Type': 'application/json' }
  });
}

// Dummy getUserIP implementation (replace with real IP fetch logic)
async function getUserIP() {
  // Example: Use a public IP API
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  return data.ip;
}
