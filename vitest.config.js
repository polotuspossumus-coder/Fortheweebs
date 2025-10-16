import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Use jsdom so @testing-library/react can access document/window
    environment: 'jsdom',
    // Only run tests inside the workspace tests/ to avoid duplicate discovery
    include: ['tests/**/*.{js,jsx}'],
  },
});
