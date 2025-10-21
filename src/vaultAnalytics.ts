// vaultAnalytics.ts
export async function getVaultStats(userId: string) {
  const response = await fetch(`/api/vault/analytics/${userId}`);
  if (!response.ok) throw new Error('Vault analytics fetch failed');
  return await response.json(); // returns asset views, downloads, remix usage, tier access
}
