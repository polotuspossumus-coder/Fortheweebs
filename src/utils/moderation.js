export async function blockUser(blockerIP, blockedUserID) {
  await fetch('/api/block', {
    method: 'POST',
    body: JSON.stringify({ blockerIP, blockedUserID }),
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function isBlocked(viewerIP, contentOwnerID) {
  const res = await fetch(`/api/isBlocked?ip=${viewerIP}&owner=${contentOwnerID}`);
  const { blocked } = await res.json();
  return blocked;
}

export async function submitAppeal(bannedIP, message) {
  await fetch('/api/appeal', {
    method: 'POST',
    body: JSON.stringify({ ip: bannedIP, message }),
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function getAppealsForReview() {
  const res = await fetch('/api/appeals');
  return await res.json(); // [{ ip, message, timestamp }]
}

export async function resolveAppeal(ip, action) {
  await fetch('/api/appeal-resolution', {
    method: 'POST',
    body: JSON.stringify({ ip, action }), // action: 'approve' or 'reject'
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function logEvent(type, details) {
  await fetch('/api/ledger', {
    method: 'POST',
    body: JSON.stringify({ type, details }),
    headers: { 'Content-Type': 'application/json' }
  });
}
