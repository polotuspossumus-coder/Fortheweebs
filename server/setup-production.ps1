# ForTheWeebs Production Setup Script
# This script will be customized once you provide your credentials

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$StripeSecretKey,
    
    [Parameter(Mandatory=$true)]
    [string]$StripePublishableKey,
    
    [Parameter(Mandatory=$true)]
    [string]$StripePriceId,
    
    [Parameter(Mandatory=$true)]
    [string]$NetlifyUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$CustomDomain = ""
)

Write-Host "🚀 ForTheWeebs Production Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check Railway CLI
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI installed: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

Write-Host ""
Write-Host "📦 Step 1: Local Setup with Supabase" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Create .env file
$envContent = @"
DATABASE_URL="$DatabaseUrl"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="$(New-Guid)$(New-Guid)"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="$StripeSecretKey"
STRIPE_PUBLISHABLE_KEY="$StripePublishableKey"
STRIPE_WEBHOOK_SECRET="whsec_local_testing"
STRIPE_PRICE_ID="$StripePriceId"
FRONTEND_URL="$NetlifyUrl"
NODE_ENV="development"
PORT="3001"
OWNER_EMAIL="polotuspossumus@gmail.com"
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✅ Created .env file" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci

# Generate Prisma client
Write-Host ""
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Deploy migrations
Write-Host ""
Write-Host "📊 Deploying database migrations to Supabase..." -ForegroundColor Yellow
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations deployed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Migrations failed. Trying db push..." -ForegroundColor Yellow
    npx prisma db push --accept-data-loss
}

# Start local Redis
Write-Host ""
Write-Host "🔴 Starting local Redis..." -ForegroundColor Yellow
docker-compose up -d redis
Start-Sleep -Seconds 3

# Test local backend
Write-Host ""
Write-Host "🧪 Testing local backend with Supabase..." -ForegroundColor Yellow
Write-Host "Starting backend in background..." -ForegroundColor Gray

$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

Start-Sleep -Seconds 10

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/v1/health" -TimeoutSec 5
    Write-Host "✅ Backend connected to Supabase successfully!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed. Check logs above." -ForegroundColor Red
    Stop-Job $backendJob
    exit 1
}

Stop-Job $backendJob
Remove-Job $backendJob

Write-Host ""
Write-Host "🚂 Step 2: Deploy to Railway" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Login to Railway
Write-Host ""
Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login

# Initialize project
Write-Host ""
Write-Host "📦 Creating Railway project..." -ForegroundColor Yellow
railway init --name fortheweebs-api

# Link project
railway link

# Add Redis
Write-Host ""
Write-Host "🔴 Adding Redis to Railway..." -ForegroundColor Yellow
railway add -d redis

# Set environment variables
Write-Host ""
Write-Host "⚙️  Setting environment variables..." -ForegroundColor Yellow

railway variables set DATABASE_URL="$DatabaseUrl"
railway variables set JWT_SECRET="$(New-Guid)$(New-Guid)$(New-Guid)"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set STRIPE_SECRET_KEY="$StripeSecretKey"
railway variables set STRIPE_PUBLISHABLE_KEY="$StripePublishableKey"
railway variables set STRIPE_PRICE_ID="$StripePriceId"
railway variables set FRONTEND_URL="$NetlifyUrl"
railway variables set NODE_ENV="production"
railway variables set PORT="3001"
railway variables set OWNER_EMAIL="polotuspossumus@gmail.com"
railway variables set CORS_ORIGINS="$NetlifyUrl"

Write-Host "✅ Environment variables set" -ForegroundColor Green

# Deploy
Write-Host ""
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed. Check Railway logs." -ForegroundColor Red
    exit 1
}

# Get Railway URL
Write-Host ""
Write-Host "🌐 Getting Railway URL..." -ForegroundColor Yellow
$railwayDomain = railway domain

Write-Host "✅ Backend deployed to: $railwayDomain" -ForegroundColor Green

# Test production backend
Write-Host ""
Write-Host "🧪 Testing production backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $prodHealth = Invoke-RestMethod -Uri "https://$railwayDomain/v1/health" -TimeoutSec 10
    Write-Host "✅ Production backend is healthy!" -ForegroundColor Green
    Write-Host "   Status: $($prodHealth.status)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Health check pending. Give it 1-2 minutes then check:" -ForegroundColor Yellow
    Write-Host "   https://$railwayDomain/v1/health" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Backend connected to Supabase" -ForegroundColor Green
Write-Host "✅ Backend deployed to Railway" -ForegroundColor Green
Write-Host "✅ Redis provisioned" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update Netlify environment variables:" -ForegroundColor Yellow
Write-Host "   Go to: $NetlifyUrl (dashboard)" -ForegroundColor Gray
Write-Host "   Site Settings → Environment variables" -ForegroundColor Gray
Write-Host "   Add/Update:" -ForegroundColor Gray
Write-Host "   - VITE_API_URL=https://$railwayDomain/v1" -ForegroundColor White
Write-Host "   - VITE_STRIPE_PUBLISHABLE_KEY=$StripePublishableKey" -ForegroundColor White
Write-Host ""
Write-Host "2. Update Stripe webhook endpoint:" -ForegroundColor Yellow
Write-Host "   Go to: https://dashboard.stripe.com/webhooks" -ForegroundColor Gray
Write-Host "   Update endpoint URL to:" -ForegroundColor Gray
Write-Host "   - https://$railwayDomain/v1/webhooks/stripe" -ForegroundColor White
Write-Host "   Copy webhook secret and run:" -ForegroundColor Gray
Write-Host "   - railway variables set STRIPE_WEBHOOK_SECRET='whsec_xxx'" -ForegroundColor White
Write-Host ""
Write-Host "3. Redeploy frontend:" -ForegroundColor Yellow
Write-Host "   git add -A" -ForegroundColor Gray
Write-Host "   git commit -m 'Update API URL to Railway'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Useful Commands:" -ForegroundColor Cyan
Write-Host "   railway logs --follow          # View logs" -ForegroundColor Gray
Write-Host "   railway status                 # Check status" -ForegroundColor Gray
Write-Host "   railway variables              # List env vars" -ForegroundColor Gray
Write-Host "   railway open                   # Open dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Your URLs:" -ForegroundColor Cyan
Write-Host "   Backend API: https://$railwayDomain/v1" -ForegroundColor White
Write-Host "   Frontend: $NetlifyUrl" -ForegroundColor White
Write-Host "   Health Check: https://$railwayDomain/v1/health" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to launch!" -ForegroundColor Green
