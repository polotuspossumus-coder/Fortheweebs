import { test, expect } from '@playwright/test';

test('Full onboarding flow: signup → payment → role → campaign', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');

  await page.fill('#email', 'test@weebs.com');
  await page.fill('#password', 'securepassword123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/payment');
  await page.click('button#pay-now');

  await page.waitForURL('**/onboarding/finalize');
  await page.click('button#finalize-onboarding');

  await page.waitForSelector('#onboarding-success');
  const successText = await page.textContent('#onboarding-success');
  expect(successText).toContain('Welcome, Creator!');
});
