import { GenesisProtocol } from '../src/GenesisProtocol';

test('GenesisProtocol returns expected keys', async () => {
  const result = await GenesisProtocol();
  expect(result).toHaveProperty('remixAnchor');
  expect(result).toHaveProperty('timestamp');
  expect(result).toHaveProperty('sovereignHash');
});
