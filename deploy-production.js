import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🚀 Starting production deployment...\n');

// Read environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

console.log(`✅ Loaded ${Object.keys(envVars).length} environment variables\n`);

// Create a script to set all env vars
let setEnvScript = '@echo off\n';
for (const [key, value] of Object.entries(envVars)) {
  setEnvScript += `netlify env:set "${key}" "${value}"\n`;
}

writeFileSync('set-env-vars.bat', setEnvScript);
console.log('✅ Created environment variable script\n');

try {
  console.log('📦 Building production bundle...\n');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build successful!\n');

  console.log('🌐 Deploying to production...\n');
  execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });

  console.log('\n🎉 DEPLOYMENT COMPLETE!\n');
  console.log('Your site is live at: https://fortheweebs.netlify.app\n');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
