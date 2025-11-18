# 🤖 Mico Assistant Setup

## Problem: Mico Not Working

Mico needs the Anthropic API key to function. Currently it's not set in your Vercel environment.

## Quick Fix

### 1. Get Your Anthropic API Key

Go to: https://console.anthropic.com/settings/keys

- Click "Create Key"
- Copy the key (starts with `sk-ant-`)

### 2. Add to Vercel (Choose One Method)

**Method A: Via CLI (Fast)**
```powershell
vercel env add ANTHROPIC_API_KEY
```
- When prompted, paste your key
- Select: Production, Preview, Development (all three)
- Press Enter

**Method B: Via Dashboard**
1. Go to: https://vercel.com/jacobs-projects-eac77986/fortheweebs/settings/environment-variables
2. Click "Add New"
3. Name: `ANTHROPIC_API_KEY`
4. Value: `sk-ant-your_key_here`
5. Select all environments
6. Save

### 3. Redeploy

After adding the key:
```powershell
vercel --prod --yes
```

## What Mico Uses

- **Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Endpoint**: `/api/mico/chat.js` (Vercel serverless function)
- **Features**: 
  - Read/write files
  - Run terminal commands
  - Deploy code
  - Fix bugs
  - Create features

## Test Mico

Once deployed, click the purple brain icon (🧠) in bottom right and try:
- "What files are in src/components?"
- "Fix the navigation bug"
- "Add a dark mode toggle"

---

**Current Status**: ANTHROPIC_API_KEY not found in Vercel environment
**Action Required**: Add key via CLI or dashboard, then redeploy
