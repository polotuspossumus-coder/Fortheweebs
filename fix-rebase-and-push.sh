#!/bin/bash

echo "🔧 Resolving Git lock and rebase interruption..."

# Step 1: Kill any lingering Git processes (optional, safe fallback)
pkill -f git || true

# Step 2: Remove lock file if it exists
rm -f .git/index.lock

# Step 3: Stage all changes
git add -A

# Step 4: Commit if needed (amend if mid-rebase)
if git status | grep -q "rebase in progress"; then
  echo "🌀 Rebase detected — amending commit..."
  git commit --amend --no-edit || true
  git rebase --continue
else
  echo "✅ No rebase in progress — committing normally..."
  git commit -m "Finalize changes after lock recovery" || true
fi

# Step 5: Push with lease to avoid overwriting others
git push origin main --force-with-lease

echo "🚀 Rebase complete and pushed to GitHub."
