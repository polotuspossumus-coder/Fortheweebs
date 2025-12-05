# 🔬 DIAGNOSTIC TEST SCRIPT
# Purpose: Start Vite with full diagnostic logging and capture crash forensics

Write-Host "🔬 Starting Vite Diagnostic Mode..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Backup current files
Write-Host "📦 Backing up current config..." -ForegroundColor Yellow
Copy-Item "vite.config.mjs" "vite.config.backup.mjs" -Force -ErrorAction SilentlyContinue
Copy-Item "src\index.jsx" "src\index.backup.jsx" -Force -ErrorAction SilentlyContinue

# Use diagnostic versions
Write-Host "🔬 Activating diagnostic config..." -ForegroundColor Yellow
Copy-Item "vite.config.diagnostic.mjs" "vite.config.mjs" -Force
Copy-Item "src\index.diagnostic.jsx" "src\index.jsx" -Force

# Clear caches
Write-Host "🧹 Clearing Vite caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🚀 Starting Vite with diagnostic hooks..." -ForegroundColor Green
Write-Host "📊 Watch the logs below for crash forensics:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Start Vite and capture output
npm run dev 2>&1 | Tee-Object -FilePath "diagnostic.log"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📋 Diagnostic log saved to: diagnostic.log" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 To restore original files, run:" -ForegroundColor Yellow
Write-Host "   Copy-Item vite.config.backup.mjs vite.config.mjs -Force" -ForegroundColor Gray
Write-Host "   Copy-Item src\index.backup.jsx src\index.jsx -Force" -ForegroundColor Gray
