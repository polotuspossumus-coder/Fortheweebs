Write-Host "🔧 Fixing Git lock and force-pushing clean state..."

# Remove common lock files
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue

# Reset and clean repo
git reset --hard
git clean -fd

# Reinstall dependencies
npm install

# Stage and commit everything
git add .
git commit -m "🔧 Fix lock file issue and force push"

# Force push to origin
git push origin main --force

Write-Host "✅ Git lock cleared and repo pushed successfully."
