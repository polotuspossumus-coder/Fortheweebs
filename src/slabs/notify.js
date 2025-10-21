// Stub for process if not defined
const process = typeof process !== 'undefined' ? process : { env: {} };
import nodemailer from 'nodemailer';
import axios from 'axios';

export async function notifyOnboardingComplete(user) {
  // Email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
  user: typeof process !== 'undefined' ? process.env.NOTIFY_EMAIL : '',
  pass: typeof process !== 'undefined' ? process.env.NOTIFY_PASS : '',
    },
  });

  await transporter.sendMail({
    from: '"Fortheweebs" <no-reply@weebs.com>',
    to: user.email,
    subject: 'Welcome aboard!',
    text: `Hi ${user.email}, your creator onboarding is complete!`,
  });

  // Discord
  await axios.post(typeof process !== 'undefined' ? process.env.DISCORD_WEBHOOK_URL : '', {
    content: `🎉 Creator onboarded: ${user.email}`,
  });
}
