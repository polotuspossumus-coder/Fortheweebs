# ForTheWeebs Server Startup Script (Foreground Mode)
# Runs server attached to terminal with health check after startup

Write-Host ""
Write-Host "🚀 STARTING FORTHEWEEBS SERVER (FOREGROUND MODE)" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray
Write-Host ""

# Start server in foreground (attached to this terminal)
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node server.js
}

Write-Host "⏳ Waiting 5 seconds for server to bind..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🔍 HEALTH CHECK" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ SERVER IS ALIVE AND RESPONDING!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
        
        $health = $response.Content | ConvertFrom-Json
        Write-Host "Environment: $($health.environment)" -ForegroundColor White
        Write-Host "Status: $($health.status)" -ForegroundColor White
        
        if ($health.features) {
            $featureCount = ($health.features.PSObject.Properties | Measure-Object).Count
            Write-Host "Features: $featureCount loaded" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "🎯 Server URL: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "📊 Health: http://localhost:3001/health" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        
        # Show server logs in real-time
        Write-Host "📜 SERVER LOGS:" -ForegroundColor Cyan
        Write-Host "=" * 60 -ForegroundColor DarkGray
        Receive-Job $serverJob -Wait
        
    } else {
        Write-Host "⚠️ Server responded with status $($response.StatusCode)" -ForegroundColor Yellow
        Receive-Job $serverJob
    }
    
} catch {
    Write-Host "❌ SERVER NOT RESPONDING!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📜 SERVER OUTPUT:" -ForegroundColor Yellow
    Receive-Job $serverJob
    Write-Host ""
    Write-Host "💡 The server may have crashed. Check logs above." -ForegroundColor Yellow
    
    # Clean up
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -ErrorAction SilentlyContinue
    exit 1
}
