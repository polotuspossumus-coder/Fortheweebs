#!/bin/bash

echo "🚀 ForTheWeebs Backend Setup"
echo "================================"
echo ""

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your Stripe keys."
    echo ""
else
    echo "✅ .env file exists"
    echo ""
fi

# Start Docker containers
echo "🐳 Starting PostgreSQL and Redis..."
docker-compose up -d
sleep 3
echo "✅ Database containers started"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Run migrations
echo "🗃️  Running database migrations..."
npx prisma migrate dev --name init
echo "✅ Database migrated"
echo ""

echo "================================"
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Stripe keys"
echo "2. Run: npm run dev"
echo "3. Server will be at http://localhost:3001/v1"
echo ""
echo "Stripe Webhook Testing:"
echo "  stripe login"
echo "  stripe listen --forward-to localhost:3001/v1/webhooks/stripe"
echo ""
