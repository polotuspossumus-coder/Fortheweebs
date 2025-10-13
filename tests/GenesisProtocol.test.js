import { GenesisProtocol } from '../src/GenesisProtocol';

test('GenesisProtocol returns expected keys', async () => {
  const result = await GenesisProtocol();
  expect(result).toHaveProperty('remixAnchor');
  expect(result).toHaveProperty('timestamp');
  expect(result).toHaveProperty('sovereignHash');
});

test('GenesisProtocol throws error on invalid input', async () => {
  await expect(() => GenesisProtocol(null)).rejects.toThrow();
});

test('GenesisProtocol returns null for missing data', async () => {
  // Simulate missing data scenario if possible
  const result = await GenesisProtocol(undefined);
  expect(result).toBeNull();
});
