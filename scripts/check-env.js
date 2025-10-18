const requiredVars = [
  'DATABASE_URL',
  'VERCEL_TOKEN',
  'VERCEL_PROJECT_ID',
  'VERCEL_ORG_ID',
  'NOTIFY_EMAIL',
  'NOTIFY_PASS',
  'DISCORD_WEBHOOK_URL',
];

const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.');
}
