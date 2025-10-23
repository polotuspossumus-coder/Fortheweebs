import { test, expect } from '@playwright/test';

test('GET /profile returns 200', async ({ request }) => {
  const res = await request.get('/profile');
  expect(res.status()).toBe(200);
});
