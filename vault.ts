import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

const credential = new DefaultAzureCredential();
const client = new SecretClient(process.env.KEY_VAULT_URL, credential);

export async function getSecret(name: string) {
  const secret = await client.getSecret(name);
  return secret.value;
}
