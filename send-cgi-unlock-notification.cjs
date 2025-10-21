require('dotenv').config();
const https = require('https');

// Example event data; in production, load this from a file, API, or process.argv
const event = {
  creatorId: 17,
  event: 'CGI Engine Unlocked',
  timestamp: '2025-10-20T22:22:00Z',
  amountPaid: 100,
  accessLevel: 'Full CGI',
  flags: ['renderAccess', 'tributeMode'],
};

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
if (!webhookUrl) {
  console.error('❌ DISCORD_WEBHOOK_URL is not set.');
  process.exit(1);
}

const payload = {
  username: 'Fortheweebs Sentinel',
  content: `<@&123456789012345678> CGI Engine Unlocked for Creator #${event.creatorId}`,
  embeds: [
    {
      title: '🎬 CGI Access Granted',
      description: `Creator #${event.creatorId} has unlocked full CGI rendering capabilities.`,
      color: 0xff3366,
      fields: [
        { name: 'Tier', value: 'Founding 25', inline: true },
        { name: 'CGI Upgrade', value: `$${event.amountPaid} Paid`, inline: true },
        { name: 'Ledger Entry', value: '✅ Logged as sovereign milestone' },
        { name: 'Access Level', value: event.accessLevel, inline: true },
        { name: 'Flags', value: event.flags.join(', '), inline: true },
      ],
      footer: {
        text: 'Fortheweebs Protocol Engine',
      },
      timestamp: event.timestamp,
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
req.end(() => {
  console.log(`✅ CGI unlock notification dispatched for Creator #${event.creatorId}.`);
});
