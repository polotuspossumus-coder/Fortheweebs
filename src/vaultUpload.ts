// vaultUpload.ts
// @ts-ignore
import { isTierAllowed } from './tierAccess.js';
// @ts-ignore
import type { VaultMetadata } from './types/vault.js';

export async function uploadVaultAsset(file: File, metadata: VaultMetadata, userTier: string) {
  if (!isTierAllowed(userTier, metadata.tier)) throw new Error('Tier access denied');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));

  const response = await fetch('/api/vault/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  return await response.json(); // returns asset ID, fingerprint, vault path
}
