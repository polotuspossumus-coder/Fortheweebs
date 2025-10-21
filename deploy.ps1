Write-Host "🚀 Deploying Vanguard Remix Engine..."

# Install dependencies
npm install

# Start MongoDB (if installed locally)
# Check if mongod is available
if (Get-Command mongod -ErrorAction SilentlyContinue) {
    Start-Process mongod -ArgumentList "--dbpath C:\data\db --logpath C:\data\log\mongodb.log --fork" -NoNewWindow -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start server
Start-Process node -ArgumentList "server.js" -NoNewWindow

Write-Host "✅ Vanguard Remix Engine is live at http://localhost:3000"