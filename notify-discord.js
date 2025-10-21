const https = require('https');
require('dotenv').config();

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const payload = {
  username: 'Fortheweebs Sentinel',
  avatar_url: 'https://i.imgur.com/your-avatar.png', // Optional
  embeds: [
    {
      title: '🚀 Fortheweebs Build Complete',
      description: 'The latest production build has finished successfully and the artifact is ready.',
      color: 0x00ff99,
      fields: [
        { name: 'Status', value: '✅ Success', inline: true },
        { name: 'Timestamp', value: new Date().toISOString(), inline: true },
      ],
      footer: {
        text: 'Sovereign signal dispatched to council',
      },
    },
  ],
};

const req = https.request(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

req.write(JSON.stringify(payload));
req.end();
