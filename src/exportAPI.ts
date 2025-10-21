// exportAPI.ts
export async function exportArtifactToPlatform(artifactId: string, platform: 'github' | 'drive' | 'dropbox') {
  const response = await fetch(`/api/export/${artifactId}?platform=${platform}`);
  if (!response.ok) throw new Error('Export failed');
  return await response.json(); // returns export status, fingerprint, sync confirmation
}
