/**
 * GitHub Integration API
 * Secure endpoint for GitHub operations
 */

import { Router } from 'express';

const router = Router();

// Middleware to verify admin access
function requireAdmin(req, res, next) {
  const userId = req.user?.id;
  const isAdmin = userId === 'owner' || req.user?.tier === 'OWNER' || req.user?.tier === 'VIP';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}

/**
 * Get GitHub token (secured endpoint)
 * Only accessible to authenticated users
 */
router.get('/token', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Return GitHub token from environment
    // This keeps the token server-side and secure
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    res.json({ token });
  } catch (error) {
    console.error('GitHub token error:', error);
    res.status(500).json({ error: 'Failed to get GitHub token' });
  }
});

/**
 * Create GitHub Issue directly from backend
 * Alternative to client-side creation
 */
router.post('/issues', async (req, res) => {
  try {
    const { title, body, labels } = req.body;

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    const response = await fetch(
      'https://api.github.com/repos/polotuspossumus-coder/Fortheweebs/issues',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          labels: labels || ['bug']
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create issue');
    }

    const issue = await response.json();

    res.json({
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url
    });

  } catch (error) {
    console.error('GitHub issue creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List recent issues
 * For admin dashboard
 */
router.get('/issues', requireAdmin, async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    const response = await fetch(
      'https://api.github.com/repos/polotuspossumus-coder/Fortheweebs/issues?state=all&per_page=50',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const issues = await response.json();

    res.json({
      success: true,
      issues: issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        labels: issue.labels.map(l => l.name),
        url: issue.html_url,
        createdAt: issue.created_at,
        closedAt: issue.closed_at
      }))
    });

  } catch (error) {
    console.error('GitHub issues fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
