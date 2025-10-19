import axios from 'axios';

const endpoints = [
  '/',
  '/api/onboarding/finalize',
  '/api/campaign/status?userId=test-user',
  '/api/admin/events',
];

(async () => {
  for (const url of endpoints) {
    try {
      const res = await axios.get(`https://fortheweebs.vercel.app${url}`);
      console.log(`✅ ${url} responded with ${res.status}`);
    } catch (err) {
      if (err instanceof Error) {
        console.error(`❌ ${url} failed:`, err.message);
      } else {
        console.error(`❌ ${url} failed:`, String(err));
      }
      process.exit(1);
    }
  }
})();
