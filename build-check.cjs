// build-check.cjs
// Pre-launch validator for Fortheweebs
const fs = require('fs');
const path = require('path');

function checkEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file missing');
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (!envContent.includes('DISCORD_WEBHOOK_URL')) {
    console.error('❌ DISCORD_WEBHOOK_URL missing in .env');
    process.exit(1);
  }
  console.log('✅ .env file and webhook present');
}

function checkRoutes() {
  const routesPath = path.resolve(__dirname, 'src', 'Routes.js');
  if (!fs.existsSync(routesPath)) {
    console.warn('⚠️ Routes.js not found, skipping route check');
    return;
  }
  const routesContent = fs.readFileSync(routesPath, 'utf-8');
  if (!routesContent.includes('onboarding')) {
    console.error('❌ /onboarding route missing');
    process.exit(1);
  }
  console.log('✅ /onboarding route present');
}

function checkBuildFolder() {
  const distPath = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build output folder (dist) missing');
    process.exit(1);
  }
  console.log('✅ Build output folder present');
}

function checkRequiredFiles() {
  const requiredFiles = [
    path.resolve(__dirname, 'src', 'components', 'CampaignMetricsPanel.jsx'),
    path.resolve(__dirname, 'src', 'components', 'GovernancePanel.tsx'),
    path.resolve(__dirname, 'src', 'utils', 'onboarding.js'),
    path.resolve(__dirname, 'src', 'routes', 'creatorLedger.js'),
    path.resolve(__dirname, 'src', 'components', 'CreatorSpotlight.jsx'),
    path.resolve(__dirname, 'src', 'components', 'PaymentPanel.jsx'),
    path.resolve(__dirname, 'src', 'components', 'AuditLog.jsx'),
    path.resolve(__dirname, 'src', 'components', 'RewardEngine.jsx'),
    path.resolve(__dirname, 'src', 'components', 'RitualTracker.jsx'),
  ];
  let missing = [];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missing.push(file);
    }
  }
  if (missing.length > 0) {
    console.error('❌ Missing required files/slabs:');
    missing.forEach(f => console.error('   - ' + f));
    process.exit(1);
  }
  console.log('✅ All required slabs/files present');
}

function main() {
  checkEnv();
  checkRoutes();
  checkBuildFolder();
  checkRequiredFiles();
  console.log('✅ Pre-launch validation passed. Ready for go-live!');
}

main();
