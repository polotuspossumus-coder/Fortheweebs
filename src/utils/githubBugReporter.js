/**
 * GitHub Bug Reporter
 * Automatically creates GitHub Issues from bug reports
 */

const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = 'polotuspossumus-coder';
const REPO_NAME = 'Fortheweebs';

/**
 * Create GitHub Issue from bug report
 * @param {Object} bugData - Bug report data
 * @param {string} bugData.title - Bug title
 * @param {string} bugData.description - Bug description
 * @param {string} bugData.severity - Bug severity (critical, high, medium, low)
 * @param {string} bugData.category - Bug category (frontend, backend, ui, performance)
 * @param {Object} bugData.context - Additional context (browser, url, user agent, etc.)
 */
export async function createGitHubIssue(bugData) {
  try {
    // Get GitHub token from backend (to keep it secure)
    const tokenResponse = await fetch('/api/github/token', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!tokenResponse.ok) {
      console.error('Failed to get GitHub token');
      return { success: false, error: 'Authentication failed' };
    }

    const { token } = await tokenResponse.json();

    // Build issue body with context
    const issueBody = `
## 🐛 Bug Report

**Description:**
${bugData.description}

**Severity:** \`${bugData.severity}\`
**Category:** \`${bugData.category}\`

---

### 📋 Context

- **URL:** ${bugData.context?.url || window.location.href}
- **Browser:** ${bugData.context?.browser || navigator.userAgent}
- **Viewport:** ${bugData.context?.viewport || `${window.innerWidth}x${window.innerHeight}`}
- **Timestamp:** ${new Date().toISOString()}
- **User:** ${bugData.context?.userId || 'anonymous'}
- **Tier:** ${bugData.context?.userTier || 'unknown'}

### 🔍 Steps to Reproduce

${bugData.stepsToReproduce || '_Not provided_'}

### 📸 Screenshots

${bugData.screenshots ? bugData.screenshots.map((url, i) => `![Screenshot ${i + 1}](${url})`).join('\n') : '_No screenshots attached_'}

### 🔧 Expected Behavior

${bugData.expectedBehavior || '_Not specified_'}

### 💻 Actual Behavior

${bugData.actualBehavior || '_See description above_'}

---

**Reported via:** ForTheWeebs Bug Reporter
**Reporter IP:** ${bugData.context?.ipAddress || 'unknown'}
`;

    // Determine labels based on severity and category
    const labels = ['bug', `severity:${bugData.severity}`];
    
    if (bugData.category === 'backend') {
      labels.push('bug-backend');
    }
    
    if (bugData.severity === 'critical') {
      labels.push('priority:urgent');
    }

    // Create GitHub Issue
    const response = await fetch(`${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `🐛 ${bugData.title}`,
        body: issueBody,
        labels: labels
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create issue');
    }

    const issue = await response.json();

    console.log('✅ GitHub Issue created:', issue.html_url);

    return {
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url
    };

  } catch (error) {
    console.error('❌ Failed to create GitHub issue:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Enhanced bug reporter that sends to both backend and GitHub
 */
export async function reportBug(bugReport) {
  const results = {
    backend: null,
    github: null
  };

  // Send to backend database
  try {
    const backendResponse = await fetch('/api/bugs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(bugReport)
    });

    results.backend = {
      success: backendResponse.ok,
      data: await backendResponse.json()
    };
  } catch (error) {
    results.backend = { success: false, error: error.message };
  }

  // Create GitHub Issue
  results.github = await createGitHubIssue(bugReport);

  // Return combined results
  return {
    success: results.backend.success || results.github.success,
    backend: results.backend,
    github: results.github,
    message: results.github.success 
      ? `Bug reported! Track it at: ${results.github.issueUrl}`
      : 'Bug saved to database'
  };
}

/**
 * Get bug report template with auto-captured context
 */
export function getBugReportContext() {
  return {
    url: window.location.href,
    browser: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString(),
    userId: localStorage.getItem('userId'),
    userTier: localStorage.getItem('userTier'),
    localStorage: Object.keys(localStorage).length,
    memory: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576)
    } : null,
    errors: window.recentErrors || []
  };
}

export default {
  createGitHubIssue,
  reportBug,
  getBugReportContext
};
