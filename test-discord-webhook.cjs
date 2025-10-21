require('dotenv').config();
const https = require('https');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
  console.error('❌ DISCORD_WEBHOOK_URL is not set.');
  process.exit(1);
}

const payload = {
  username: 'Fortheweebs Sentinel',
  content: '📡 Ritual test: webhook is live and sovereign.',
};

const req = https.request(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

req.write(JSON.stringify(payload));
req.end(() => {
  console.log('✅ Webhook test dispatched.');
});
