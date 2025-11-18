# 🚀 Start ForTheWeebs Backend

## Quick Start (Windows)

### Option 1: PowerShell Script (Recommended)
```powershell
cd server
.\setup.ps1
```

Then:
```powershell
npm run dev
```

### Option 2: Manual Setup

1. **Start Docker Desktop**

2. **Start Database**
```powershell
cd server
docker-compose up -d
```

3. **Setup Environment**
```powershell
copy .env.example .env
# Edit .env with your Stripe keys
```

4. **Install & Setup**
```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init
```

5. **Start Server**
```powershell
npm run dev
```

Server runs at: **http://localhost:3001/v1**

## Quick Start (Mac/Linux)

```bash
cd server
chmod +x setup.sh
./setup.sh
npm run dev
```

## Configuration

Edit `server/.env`:

```env
# Required
DATABASE_URL="postgresql://fortheweebs:fortheweebs_password@localhost:5432/fortheweebs?schema=public"
JWT_SECRET="your-random-secret-here"

# Stripe (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Get from stripe listen

# Frontend
FRONTEND_URL="http://localhost:5173"
PORT=3001
```

## Test API

### 1. Create Owner Account
```powershell
$body = @{
    email = "polotuspossumus@gmail.com"
    username = "polotuspossumus"
    password = "Scorpio#96"
    displayName = "Polotus Possumus"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/signup" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$token = $response.token
Write-Host "✅ Account created! Token: $token"
```

### 2. Test Auth
```powershell
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/me" `
    -Method Get `
    -Headers $headers
```

### 3. Create Test Post
```powershell
$postBody = @{
    body = "Hello from ForTheWeebs!"
    visibility = "PUBLIC"
    isPaid = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/posts" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $postBody
```

### 4. Get Feed
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/v1/posts/feed" `
    -Method Get `
    -Headers $headers
```

## Stripe Webhook Setup

1. **Install Stripe CLI**
   - Windows: Download from https://github.com/stripe/stripe-cli/releases/latest
   - Mac: `brew install stripe/stripe-cli/stripe`

2. **Login**
```bash
stripe login
```

3. **Forward Webhooks**
```bash
stripe listen --forward-to localhost:3001/v1/webhooks/stripe
```

4. **Copy Webhook Secret**
```
> Ready! Your webhook signing secret is whsec_abc123...
```

5. **Update .env**
```env
STRIPE_WEBHOOK_SECRET="whsec_abc123..."
```

## Database Management

### View Database (GUI)
```bash
npx prisma studio
```
Opens at http://localhost:5555

### Direct SQL Access
```bash
docker exec -it fortheweebs-postgres psql -U fortheweebs -d fortheweebs
```

## Endpoints

### Auth
- `POST /v1/auth/signup` - Create account
- `POST /v1/auth/login` - Login
- `GET /v1/auth/me` - Get current user

### Social
- `POST /v1/users/:id/follow` - Follow/unfollow
- `POST /v1/users/:id/friend-requests` - Send friend request
- `POST /v1/friend-requests/:id/accept` - Accept request
- `GET /v1/users/:id/friends` - Get friends
- `GET /v1/users/:id/followers` - Get followers

### Subscriptions
- `POST /v1/users/:id/subscriptions` - Create checkout ($1000)
- `GET /v1/users/:id/subscriptions/me` - Check status
- `POST /v1/webhooks/stripe` - Webhook handler

### Posts
- `POST /v1/posts` - Create post
- `GET /v1/posts/feed` - Get feed (visibility-filtered)
- `GET /v1/posts/:id` - Get single post
- `POST /v1/posts/:id/like` - Like post

### Stats
- `GET /v1/users/:id/stats` - Social stats
- `GET /v1/dashboard/stats` - Full dashboard

## Troubleshooting

### Port 3001 in use
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database won't start
```bash
docker-compose down
docker-compose up -d
```

### Prisma errors
```bash
npx prisma generate
npx prisma db push
```

### Can't connect from frontend
- Check CORS in `src/main.ts`
- Verify PORT=3001 in `.env`
- Frontend should use `http://localhost:3001/v1`

## Next Steps

1. ✅ Backend running at http://localhost:3001/v1
2. 📝 Test API with PowerShell/curl
3. 🎨 Wire frontend to use API
4. 💳 Setup Stripe webhooks
5. 🚀 Deploy to Railway/Render

## Full Documentation

- [README.md](README.md) - Overview
- [SETUP.md](SETUP.md) - Detailed setup
- [TESTING.md](TESTING.md) - API testing guide
- [Prisma Schema](prisma/schema.prisma) - Database models

## Status Check

Backend ready when you see:
```
🚀 Server running on http://localhost:3001/v1
📊 Health check: http://localhost:3001/v1/health
```

Database ready when you see:
```bash
docker ps
# Should show: fortheweebs-postgres and fortheweebs-redis
```
