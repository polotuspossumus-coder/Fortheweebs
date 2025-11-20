const express = require('express');
const OpenAI = require('openai');
const { Octokit } = require('@octokit/rest');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Check if API keys are configured
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasGitHub = !!process.env.GITHUB_TOKEN;
const hasSupabase = !!(process.env.VITE_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY));

// Initialize OpenAI (only if key exists)
let openai;
if (hasOpenAI) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

// Initialize GitHub (only if token exists)
let octokit;
if (hasGitHub) {
    octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });
}

// Initialize Supabase (only if configured)
let supabase;
if (hasSupabase) {
    supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );
}

/**
 * Analyze Bug Screenshot with GPT-4 Vision
 * POST /api/ai/analyze-screenshot
 * 
 * Body:
 * {
 *   screenshot: base64 image data,
 *   description: string,
 *   browserInfo: object
 * }
 */
router.post('/analyze-screenshot', async (req, res) => {
    try {
        const { screenshot, description, browserInfo } = req.body;

        if (!screenshot || !description) {
            return res.status(400).json({ error: 'Screenshot and description required' });
        }

        if (!hasOpenAI) {
            return res.status(503).json({
                error: 'OpenAI API not configured',
                message: 'Please set OPENAI_API_KEY in .env file'
            });
        }

        // Call GPT-4 Vision API
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `You are a senior web developer debugging a bug. Analyze this screenshot and description:

Bug Description: ${description}

Browser Info:
- User Agent: ${browserInfo.userAgent}
- Viewport: ${browserInfo.viewport}
- URL: ${browserInfo.url}

Identify:
1. What UI elements are visible in the screenshot
2. Any error messages or stack traces
3. The likely component/file causing the issue
4. The root cause of the bug
5. Suggested fix approach

Respond in JSON format:
{
  "detectedElements": ["list of visible UI elements"],
  "errorText": "any visible error message",
  "stackTrace": "any visible stack trace or null",
  "component": "likely component name",
  "likelyIssue": "description of the issue",
  "suggestedFix": "high-level fix approach",
  "confidence": 0.0-1.0
}`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: screenshot
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        // Save analysis to database (if configured)
        if (hasSupabase) {
            await supabase
                .from('bug_analyses')
                .insert({
                    screenshot_hash: screenshot.substring(0, 50),
                    description: description,
                    analysis: analysis,
                    browser_info: browserInfo,
                    created_at: new Date().toISOString()
                });
        }

        res.json(analysis);

    } catch (error) {
        console.error('Screenshot analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze screenshot',
            message: error.message
        });
    }
});

/**
 * Generate Code Fix with GPT-4
 * POST /api/ai/generate-fix
 * 
 * Body:
 * {
 *   bugReport: object,
 *   analysis: object,
 *   codeContext: string (optional)
 * }
 */
router.post('/generate-fix', async (req, res) => {
    try {
        const { bugReport, analysis, codeContext } = req.body;

        if (!bugReport || !analysis) {
            return res.status(400).json({ error: 'Bug report and analysis required' });
        }

        if (!hasOpenAI) {
            return res.status(503).json({
                error: 'OpenAI API not configured',
                message: 'Please set OPENAI_API_KEY in .env file'
            });
        }

        // Get relevant code from repository
        let relevantCode = codeContext;
        if (!relevantCode && analysis.component && hasGitHub) {
            try {
                const { data } = await octokit.repos.getContent({
                    owner: process.env.GITHUB_REPO_OWNER,
                    repo: process.env.GITHUB_REPO_NAME,
                    path: `src/components/${analysis.component}.jsx`
                });
                relevantCode = Buffer.from(data.content, 'base64').toString('utf-8');
            } catch (err) {
                console.log('Could not fetch component code:', err.message);
            }
        }

        // Call GPT-4 for code generation
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: `You are a senior React developer. Generate precise code fixes for bugs.`
                },
                {
                    role: "user",
                    content: `Bug Analysis:
${JSON.stringify(analysis, null, 2)}

Bug Description: ${bugReport.description}
Steps to Reproduce: ${bugReport.steps}
Expected: ${bugReport.expected}
Actual: ${bugReport.actual}

${relevantCode ? `Current Code:\n\`\`\`jsx\n${relevantCode}\n\`\`\`` : ''}

Generate a precise code fix. Respond in JSON format:
{
  "file": "path/to/file.jsx",
  "changes": [
    {
      "line": number,
      "before": "exact code to replace",
      "after": "fixed code",
      "reason": "why this change fixes the bug"
    }
  ],
  "testPlan": ["list of tests to verify fix"],
  "estimatedTime": "time to apply fix",
  "autoApply": boolean
}`
                }
            ],
            max_tokens: 2000,
            temperature: 0.3
        });

        const fix = JSON.parse(response.choices[0].message.content);

        // Save fix to database (if configured)
        let fixId = null;
        if (hasSupabase) {
            const { data, error } = await supabase
                .from('bug_fixes')
                .insert({
                    bug_report_id: bugReport.id,
                    analysis_id: analysis.id,
                    fix: fix,
                    status: 'generated',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Failed to save fix:', error);
            } else {
                fixId = data?.id;
            }
        }

        res.json({ ...fix, fixId });

    } catch (error) {
        console.error('Fix generation error:', error);
        res.status(500).json({
            error: 'Failed to generate fix',
            message: error.message
        });
    }
});

/**
 * Create GitHub Pull Request with Fix
 * POST /api/ai/create-pr
 * 
 * Body:
 * {
 *   fix: object,
 *   bugReport: object,
 *   branchName: string
 * }
 */
router.post('/create-pr', async (req, res) => {
    try {
        const { fix, bugReport, branchName } = req.body;

        if (!fix || !bugReport) {
            return res.status(400).json({ error: 'Fix and bug report required' });
        }

        if (!hasGitHub) {
            return res.status(503).json({
                error: 'GitHub API not configured',
                message: 'Please set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME in .env file'
            });
        }

        const owner = process.env.GITHUB_REPO_OWNER;
        const repo = process.env.GITHUB_REPO_NAME;
        const branch = branchName || `bugfix/${bugReport.id}`;

        // Get default branch reference
        const { data: refData } = await octokit.git.getRef({
            owner,
            repo,
            ref: 'heads/main'
        });

        const mainSha = refData.object.sha;

        // Create new branch
        await octokit.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branch}`,
            sha: mainSha
        });

        // Apply changes to files
        for (const change of fix.changes) {
            try {
                // Get current file content
                const { data: fileData } = await octokit.repos.getContent({
                    owner,
                    repo,
                    path: fix.file,
                    ref: branch
                });

                const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

                // Apply the change
                const updatedContent = currentContent.replace(change.before, change.after);

                // Update file
                await octokit.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: fix.file,
                    message: `Fix: ${bugReport.description.substring(0, 50)}...`,
                    content: Buffer.from(updatedContent).toString('base64'),
                    branch,
                    sha: fileData.sha
                });

            } catch (err) {
                console.error('Error applying change:', err);
            }
        }

        // Create pull request
        const { data: prData } = await octokit.pulls.create({
            owner,
            repo,
            title: `🐛 Auto-fix: ${bugReport.description.substring(0, 50)}`,
            head: branch,
            base: 'main',
            body: `## Auto-generated Bug Fix

**Bug Report ID:** ${bugReport.id}
**Severity:** ${bugReport.severity}

### Description
${bugReport.description}

### Steps to Reproduce
${bugReport.steps}

### Expected Behavior
${bugReport.expected}

### Actual Behavior
${bugReport.actual}

### Changes Made
${fix.changes.map(c => `- **Line ${c.line}:** ${c.reason}`).join('\n')}

### Test Plan
${fix.testPlan.map(t => `- [ ] ${t}`).join('\n')}

### AI Analysis
- Component: ${bugReport.analysis?.component}
- Confidence: ${(bugReport.analysis?.confidence * 100).toFixed(0)}%
- Likely Issue: ${bugReport.analysis?.likelyIssue}

---
*This PR was automatically generated by AI Bug Fixer*
`
        });

        // Update bug fix record (if configured)
        if (hasSupabase) {
            await supabase
                .from('bug_fixes')
                .update({
                    pr_number: prData.number,
                    pr_url: prData.html_url,
                    status: 'pr_created',
                    updated_at: new Date().toISOString()
                })
                .eq('bug_report_id', bugReport.id);
        }

        res.json({
            prNumber: prData.number,
            prUrl: prData.html_url,
            branch: branch
        });

    } catch (error) {
        console.error('PR creation error:', error);
        res.status(500).json({
            error: 'Failed to create pull request',
            message: error.message
        });
    }
});

/**
 * Get Bug Report Status
 * GET /api/ai/bug/:reportId/status
 */
router.get('/bug/:reportId/status', async (req, res) => {
    try {
        const { reportId } = req.params;

        if (!hasSupabase) {
            return res.status(503).json({
                error: 'Supabase not configured',
                message: 'Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file'
            });
        }

        const { data, error } = await supabase
            .from('bug_fixes')
            .select('*, bug_reports(*)')
            .eq('bug_report_id', reportId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Bug report not found' });
        }

        res.json(data);

    } catch (error) {
        console.error('Error fetching bug status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
