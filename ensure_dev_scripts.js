const fs = require('fs');
const path = require('path');

const rootPkgPath = path.resolve(__dirname, '..', 'package.json');
const backupPath = rootPkgPath + '.backup-' + Date.now();

if (!fs.existsSync(rootPkgPath)) {
  console.error('Root package.json not found at', rootPkgPath);
  process.exit(2);
}

const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const scripts = pkg.scripts || {};

const wanted = {
  dev: 'vite',
  'dev:demo': 'vite',
  'demo:open':
    'powershell -NoProfile -Command "Start-Process \'http://localhost:5173\'; npm run dev:demo"',
  'smoke:dev': 'node .vscode/probe_local.js',
};

let changed = false;
for (const k of Object.keys(wanted)) {
  if (scripts[k] !== wanted[k]) {
    console.log(`${scripts[k] === undefined ? 'Adding' : 'Updating'} script: ${k}`);
    scripts[k] = wanted[k];
    changed = true;
  }
}

if (changed) {
  fs.copyFileSync(rootPkgPath, backupPath);
  pkg.scripts = scripts;
  fs.writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('Wrote updated package.json and backed up original to', backupPath);
} else {
  console.log('No changes needed to package.json scripts.');
}

console.log(
  '\nDone. You can run: npm run smoke:dev from the repo root to probe the dev server (after you start it).'
);
