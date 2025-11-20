/**
 * GitHub Issues API
 * Creates GitHub issues from bug reports
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'polotuspossumus-coder';
const REPO_NAME = 'Fortheweebs';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, labels = [] } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    if (!GITHUB_TOKEN) {
      console.error('❌ GITHUB_TOKEN not set in environment variables');
      return res.status(500).json({ error: 'GitHub integration not configured' });
    }

    // Create GitHub Issue
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        body,
        labels
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('GitHub API error:', error);
      throw new Error(error.message || 'Failed to create GitHub issue');
    }

    const issue = await response.json();

    console.log('✅ GitHub Issue created:', issue.html_url);

    res.status(200).json({
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url
    });

  } catch (error) {
    console.error('Create GitHub issue error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create GitHub issue'
    });
  }
};
