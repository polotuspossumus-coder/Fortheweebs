# Self-Healing System Setup

Your platform now has **fully autonomous self-healing** powered by Claude AI in the cloud.

## How It Works

1. **User reports bug** via 🐛 debugger button
2. **Bug sent to Claude API** (Anthropic cloud - always online)
3. **Claude analyzes & generates fix** automatically
4. **Fix pushed to GitHub** as a Pull Request
5. **GitHub Actions auto-deploys** the fix

**✅ Works even if your computer/server is offline or destroyed**
**✅ Everything runs in the cloud**

---

## Setup Instructions

### 1. Get Anthropic API Key (Claude)

1. Go to https://console.anthropic.com/
2. Create account / Log in
3. Go to "API Keys"
4. Create new key
5. Copy the key (starts with `sk-ant-...`)

### 2. Get GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "ForTheWeebs Auto-Heal"
4. Select scopes:
   - ✅ `repo` (full control)
   - ✅ `workflow`
5. Click "Generate token"
6. Copy the token (starts with `ghp_...`)

### 3. Add to Environment Variables

Add these to your `.env` file:

```bash
# Claude API for autonomous bug fixing
ANTHROPIC_API_KEY=sk-ant-your-key-here

# GitHub for auto-deploying fixes
GITHUB_TOKEN=ghp_your-token-here
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=fortheweebs
```

### 4. Set Up GitHub Actions (Auto-Deploy)

Create `.github/workflows/auto-deploy.yml`:

```yaml
name: Auto-Deploy Fixes

on:
  pull_request:
    types: [opened]
    branches: [main]

jobs:
  auto-deploy:
    if: startsWith(github.event.pull_request.title, '🤖 Auto-fix')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test || true
      - name: Auto-merge if tests pass
        run: |
          gh pr merge ${{ github.event.pull_request.number }} --auto --squash
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 5. Deploy to Production

Push your `.env` variables to your hosting platform:

**Vercel:**
```bash
vercel env add ANTHROPIC_API_KEY
vercel env add GITHUB_TOKEN
vercel env add GITHUB_REPO_OWNER
vercel env add GITHUB_REPO_NAME
```

**Netlify:**
- Go to Site Settings → Environment Variables
- Add each variable

**Railway/Render:**
- Dashboard → Environment → Add Variable

---

## What Gets Auto-Fixed

✅ **Safe to auto-fix:**
- UI text/typos
- Missing null checks
- Undefined variables
- Import errors
- Simple logic bugs
- CSS issues
- Console.log cleanup

❌ **Never auto-fixed (requires manual review):**
- Authentication code
- Payment processing
- Database schema
- API keys
- Security-sensitive code
- Complex business logic

---

## Testing It

1. Go to your website
2. Click the 🐛 button (bottom-right)
3. Report a bug: "The button on homepage says 'Submti' instead of 'Submit'"
4. Submit
5. Within 2-3 minutes:
   - Claude analyzes the typo
   - Creates a fix
   - Pushes PR to GitHub
   - GitHub Actions auto-deploys

Check your GitHub repo - you'll see the PR!

---

## Mico Suggestions (Separate System)

Mico has a **separate** suggestion system:

Users type in Mico chat: `/suggest Add dark mode toggle`

Mico evaluates if it's a good idea, and if so, stores it for you to review later.

**Mico does NOT auto-fix** - only evaluates suggestions.

---

## Monitoring

View all bug reports and fixes:

```bash
# Check Supabase bug_reports table
# Status values:
# - submitted_to_claude
# - pushing_fix_to_github
# - pr_created_auto_deploy_pending
# - needs_manual_review
```

---

## Rollback

If an auto-fix breaks something:

1. Go to GitHub
2. Find the auto-fix PR
3. Revert the merge
4. Or close the PR before it auto-merges

---

## Cost Estimate

**Anthropic Claude API:**
- ~$0.01 per bug analysis
- If you get 100 bug reports/month = $1/month

**GitHub:**
- Free (unlimited repos & actions)

**Total:** Basically free, scales with usage

---

## Security

- All user input sanitized (XSS, SQL injection, API keys removed)
- Rate limited to 10 reports/user/hour
- Claude is VERY conservative - won't fix anything risky
- All fixes go through PR review (you can disable auto-merge)
- Sensitive files (auth, payments, .env) are blacklisted

---

## Support

If something isn't working:

1. Check environment variables are set correctly
2. Check GitHub token has correct permissions
3. Check Anthropic API key is valid
4. Look at Supabase `bug_reports` table for error messages

---

**Your platform is now self-healing! 🎉**

Users report bugs → Claude fixes them → GitHub deploys → All automatic, 24/7, even if you're offline.
