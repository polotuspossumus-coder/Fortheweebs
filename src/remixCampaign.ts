// remixCampaign.ts
export async function launchRemixCampaign(originalArtifactId: string, remixPrompt: string, userId: string) {
  const payload = {
    originalArtifactId,
    remixPrompt,
    userId,
    legacyId: `RMX-${userId}-${Date.now()}`,
  };

  const response = await fetch('/api/campaign/remix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Remix campaign failed');
  return await response.json(); // returns campaign ID, remixed artifact, legacy sync
}
