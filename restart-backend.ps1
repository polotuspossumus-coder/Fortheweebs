#!/usr/bin/env pwsh
# Kill old server and start fresh

Write-Host "🛑 Stopping old servers..." -ForegroundColor Yellow

# Kill process on port 3000
$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($conn) {
    $processId = $conn.OwningProcess
    Write-Host "   Killing process $processId on port 3000" -ForegroundColor Cyan
    taskkill /F /PID $processId 2>$null
}

Start-Sleep -Seconds 2

Write-Host "🚀 Starting backend server..." -ForegroundColor Green
$env:PORT = 3000
node server.js
