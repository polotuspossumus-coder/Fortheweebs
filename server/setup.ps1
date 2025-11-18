# Quick Start Script for ForTheWeebs Backend

Write-Host "🚀 ForTheWeebs Backend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your Stripe keys." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    Write-Host ""
}

# Start Docker containers
Write-Host "🐳 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 3
Write-Host "✅ Database containers started" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "🗃️  Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init
Write-Host "✅ Database migrated" -ForegroundColor Green
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env with your Stripe keys" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Server will be at http://localhost:3001/v1" -ForegroundColor White
Write-Host ""
Write-Host "Stripe Webhook Testing:" -ForegroundColor Cyan
Write-Host "  stripe login" -ForegroundColor White
Write-Host "  stripe listen --forward-to localhost:3001/v1/webhooks/stripe" -ForegroundColor White
Write-Host ""
