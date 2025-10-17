import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    // Use jsdom so @testing-library/react can access document/window
    environment: 'jsdom',
    // setup file to filter noisy ReactDOMTestUtils deprecation warnings
    setupFiles: [path.resolve(__dirname, 'vitest.setup.js')],
    // Only run tests inside the workspace tests/ to avoid duplicate discovery
    include: ['tests/**/*.{js,jsx}'],
    // exclude any test setup files that might be accidentally placed inside `tests/`
    exclude: ['tests/setup*.js', 'tests/setup/**'],
  },
});
