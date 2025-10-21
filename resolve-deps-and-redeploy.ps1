Write-Host "🔧 Resolving dependency conflicts and redeploying..."

# Step 1: Remove lock files and node_modules
Remove-Item -Force -Recurse node_modules, package-lock.json

# Step 2: Install with legacy peer deps to bypass conflicts
npm install --legacy-peer-deps

# Step 3: Verify critical packages
npm ls react
npm ls @react-three/drei
npm ls @react-three/fiber

# Step 4: Stage and commit changes
git add package.json, package-lock.json

git commit -m "🔧 Resolve peer dependency conflicts and prepare redeploy"

# Step 5: Push to GitHub
git push origin main --force-with-lease

# Step 6: Trigger Vercel redeploy (if CLI is installed)
vercel --prod --yes

Write-Host "✅ Dependencies resolved, committed, and redeployment triggered."
