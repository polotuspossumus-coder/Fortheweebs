import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const chains = ['fortheweebs', 'vanguard'];
const outputDir = './dist';
const artifactDir = './artifacts';

function clean() {
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true });
  fs.mkdirSync(outputDir);
}

function compile(chain: string) {
  console.log(`🔧 Compiling ${chain}...`);
  execSync(`tsc -p chains/${chain}/tsconfig.json`, { stdio: 'inherit' });
}

function bundle(chain: string) {
  console.log(`📦 Bundling ${chain} artifacts...`);
  const src = path.join('chains', chain, 'build');
  const dest = path.join(outputDir, `${chain}.bundle.js`);
  execSync(`esbuild ${src}/index.js --bundle --minify --outfile=${dest}`, { stdio: 'inherit' });
}

function immortalize(chain: string) {
  console.log(`🪄 Immortalizing ${chain} protocol...`);
  const slab = {
    chain,
    timestamp: new Date().toISOString(),
    validatorMemory: `validators/${chain}.json`,
    ritualHooks: `rituals/${chain}.ts`,
  };
  fs.writeFileSync(path.join(artifactDir, `${chain}.slab.json`), JSON.stringify(slab, null, 2));
}

function buildAll() {
  clean();
  chains.forEach(chain => {
    compile(chain);
    bundle(chain);
    immortalize(chain);
  });
  console.log('✅ Mythic build complete.');
}

buildAll();
