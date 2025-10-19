import axios from 'axios';

export async function notifyDiscord(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  await axios.post(webhookUrl, {
    content: `🚨 **Critical Error**: ${message}`,
  });
}
