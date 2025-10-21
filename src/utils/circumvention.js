export async function detectCircumvention(fingerprint) {
  const res = await fetch('/api/fingerprint-check', {
    method: 'POST',
    body: JSON.stringify({ fingerprint }),
    headers: { 'Content-Type': 'application/json' }
  });
  const { match } = await res.json();
  return match;
}

export async function autobanUser(originalIP) {
  await fetch('/api/ban', {
    method: 'POST',
    body: JSON.stringify({ ip: originalIP }),
    headers: { 'Content-Type': 'application/json' }
  });
}
