// licensing.ts
export function assignLicense(artifactId: string, licenseType: 'exclusive' | 'remixable' | 'view-only', userId: string) {
  const payload = {
    artifactId,
    licenseType,
    userId,
    timestamp: Date.now(),
  };

  return fetch('/api/artifact/license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
