#!/usr/bin/env pwsh
# Start server and health check - Windows safe

Write-Host ""
Write-Host "🚀 STARTING FORTHEWEEBS SERVER..." -ForegroundColor Cyan
Write-Host ""

# Start server in background job
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node server.js
}

Write-Host "⏳ Waiting 5 seconds for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🔍 TESTING HEALTH ENDPOINT..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 10
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ SERVER IS ALIVE!" -ForegroundColor Green
    Write-Host "   Status: $($data.status)" -ForegroundColor White
    Write-Host "   Environment: $($data.environment)" -ForegroundColor White
    Write-Host "   Routes loaded: $($data.features.PSObject.Properties.Count)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Server running at: http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To stop the server, run: Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "❌ HEALTH CHECK FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Server job output:" -ForegroundColor Yellow
    Receive-Job -Job $job
    Write-Host ""
    
    # Clean up failed job
    Stop-Job -Job $job
    Remove-Job -Job $job
    exit 1
}
