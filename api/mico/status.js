export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.json({
    status: 'online',
    version: '2.0.0',
    platform: 'Netlify Serverless',
    tools: [
      'read-file',
      'write-file',
      'chat (Claude-powered)',
    ],
    aiIntegrated: !!process.env.ANTHROPIC_API_KEY,
    message: '🧠 Mico ready. Sovereign agent mode enabled.',
  });
}
