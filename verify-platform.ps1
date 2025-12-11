Write-Host "`n=== FORTHEWEEBS VERIFICATION REPORT ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

$checks = @{
    backend = $false
    frontend = $false
    todos = $false
    gitclean = $false
    gitsynced = $false
}

# Check Backend
try {
    $b = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Backend: ONLINE (HTTP $($b.StatusCode))" -ForegroundColor Green
    $checks.backend = $true
} catch {
    Write-Host "❌ Backend: OFFLINE" -ForegroundColor Red
}

# Check Frontend
try {
    $f = Invoke-WebRequest -Uri "http://localhost:3002" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Frontend: ONLINE (HTTP $($f.StatusCode))" -ForegroundColor Green
    $checks.frontend = $true
} catch {
    Write-Host "❌ Frontend: OFFLINE" -ForegroundColor Red
}

# Check TODOs (exclude node_modules, electron-dist, android, ios)
$todos = (Get-ChildItem -Path src,api -Recurse -Include *.jsx,*.js,*.ts,*.tsx -ErrorAction SilentlyContinue | Select-String "^\s*//\s*TODO[^ist]" | Measure-Object).Count
if ($todos -eq 0) {
    Write-Host "✅ TODOs: None found in src/ and api/" -ForegroundColor Green
    $checks.todos = $true
} else {
    Write-Host "❌ TODOs: Found $todos in src/ and api/" -ForegroundColor Red
}

# Check Git Status
$gstatus = git status --porcelain 2>$null
if ($gstatus.Length -eq 0) {
    Write-Host "✅ Git: Working tree clean" -ForegroundColor Green
    $checks.gitclean = $true
} else {
    Write-Host "❌ Git: Uncommitted changes" -ForegroundColor Red
}

# Check Git Sync
$gunpushed = git log origin/main..HEAD --oneline 2>$null
if ($gunpushed.Length -eq 0) {
    Write-Host "✅ Git: All pushed to GitHub" -ForegroundColor Green
    $checks.gitsynced = $true
} else {
    Write-Host "❌ Git: Unpushed commits" -ForegroundColor Red
}

# Latest commit
$latest = git log -1 --oneline 2>$null
Write-Host "`nLatest commit: $latest" -ForegroundColor Gray

# Final verdict
$allPass = ($checks.Values | Where-Object { $_ -eq $false }).Count -eq 0

Write-Host "`n========================================" -ForegroundColor Yellow
if ($allPass) {
    Write-Host "     PLATFORM 100% COMPLETE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "`n🎉 All systems operational and ready!" -ForegroundColor Green
} else {
    Write-Host "         ISSUES DETECTED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Yellow
    $failedChecks = $checks.GetEnumerator() | Where-Object { $_.Value -eq $false }
    Write-Host "`nFailed checks:" -ForegroundColor Red
    foreach ($check in $failedChecks) {
        Write-Host "  - $($check.Key)" -ForegroundColor Red
    }
}
