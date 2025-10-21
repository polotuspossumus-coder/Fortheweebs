// Client-side API utility for /api/upgrade-tier
export async function upgradeTier(userId) {
  const res = await fetch('/api/upgrade-tier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Upgrade failed');
  return res.json();
}
