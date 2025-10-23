import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 1,
  use: { baseURL: 'https://fortheweebs.com/api' },
});
