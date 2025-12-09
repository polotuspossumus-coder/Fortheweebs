# ForTheWeebs Build Fix Script
# Run this script after restarting your computer to fix the build issues

Write-Host "🔧 ForTheWeebs Build Fix Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Stop all node and electron processes
Write-Host "🛑 Stopping all Node and Electron processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.Name -match "node|electron"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clean npm cache
Write-Host "🧹 Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Remove node_modules and package-lock.json
Write-Host "🗑️  Removing node_modules and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
}

# Fresh install
Write-Host "📦 Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Verify React
Write-Host "🔍 Verifying React installation..." -ForegroundColor Yellow
npm list react --depth=0

# Try build
Write-Host ""
Write-Host "🔨 Attempting build..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ Done! Check output above for any errors." -ForegroundColor Green
