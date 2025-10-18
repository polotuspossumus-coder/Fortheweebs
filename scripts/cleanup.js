import fs from 'fs';
import path from 'path';

const unusedPaths = [
  'tests/tmp/',
  'coverage/',
  'dist/',
  '.next/',
  '.turbo/',
  'README.md.txt',
  'settings-suggestions.txt',
];

unusedPaths.forEach((p) => {
  const fullPath = path.resolve(p);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`🧹 Removed: ${fullPath}`);
  }
});
