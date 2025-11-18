# Backend API Testing Guide

## Test Endpoints with curl

### 1. Signup (Create Owner Account)

```bash
curl -X POST http://localhost:3001/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "polotuspossumus@gmail.com",
    "username": "polotuspossumus",
    "password": "Scorpio#96",
    "displayName": "Polotus Possumus"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "polotuspossumus@gmail.com",
    "username": "polotuspossumus",
    "displayName": "Polotus Possumus",
    "tier": "LIFETIME_VIP",
    "isOwner": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** to use in subsequent requests.

### 2. Login

```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "polotuspossumus",
    "password": "Scorpio#96"
  }'
```

### 3. Get Current User

```bash
curl http://localhost:3001/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create a Post (Public)

```bash
curl -X POST http://localhost:3001/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Hello world! This is my first post.",
    "visibility": "PUBLIC",
    "isPaid": false
  }'
```

### 5. Create a Post (Subscribers Only)

```bash
curl -X POST http://localhost:3001/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Exclusive content for my subscribers!",
    "visibility": "SUBSCRIBERS",
    "isPaid": true,
    "priceCents": 100000
  }'
```

### 6. Get Feed

```bash
curl http://localhost:3001/v1/posts/feed?limit=20&offset=0 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Follow a User

```bash
curl -X POST http://localhost:3001/v1/users/USER_ID_HERE/follow \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Send Friend Request

```bash
curl -X POST http://localhost:3001/v1/users/USER_ID_HERE/friend-requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 9. Create Subscription Checkout

```bash
curl -X POST http://localhost:3001/v1/users/CREATOR_ID_HERE/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "PREMIUM_1000",
    "priceCents": 100000
  }'
```

**Response:**
```json
{
  "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

### 10. Get User Stats

```bash
curl http://localhost:3001/v1/users/USER_ID_HERE/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "friendsCount": 5,
  "followersCount": 120,
  "followingCount": 45,
  "subscribersCount": 8,
  "subscriptionsCount": 3,
  "postsCount": 42
}
```

### 11. Get Dashboard Stats

```bash
curl http://localhost:3001/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## PowerShell Examples

### Signup
```powershell
$body = @{
    email = "polotuspossumus@gmail.com"
    username = "polotuspossumus"
    password = "Scorpio#96"
    displayName = "Polotus Possumus"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/signup" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Login and Save Token
```powershell
$loginBody = @{
    emailOrUsername = "polotuspossumus"
    password = "Scorpio#96"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $response.token
Write-Host "Token: $token"
```

### Create Post
```powershell
$postBody = @{
    body = "Test post from PowerShell"
    visibility = "PUBLIC"
    isPaid = $false
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3001/v1/posts" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $postBody
```

### Get Feed
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3001/v1/posts/feed?limit=10" `
    -Method Get `
    -Headers $headers
```

## Stripe Webhook Testing

### Setup Stripe CLI
```bash
# Install Stripe CLI
# Windows: https://github.com/stripe/stripe-cli/releases/latest

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/v1/webhooks/stripe
```

### Trigger Test Event
```bash
# Simulate a successful checkout
stripe trigger checkout.session.completed
```

### Check Webhook Secret
When you run `stripe listen`, it will print:
```
> Ready! Your webhook signing secret is whsec_1234567890...
```

Copy that secret to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET="whsec_1234567890..."
```

## Visibility Testing Scenarios

### Scenario 1: Public Post
- Create post with `visibility: "PUBLIC"`
- Anyone can see it (with or without auth)

### Scenario 2: Friends Only
1. User A sends friend request to User B
2. User B accepts
3. User A creates post with `visibility: "FRIENDS"`
4. User B can see it, others cannot

### Scenario 3: Subscribers Only
1. User A creates post with `visibility: "SUBSCRIBERS"`
2. User B subscribes to User A ($1000 payment)
3. User B can now see the post
4. Non-subscribers cannot

### Scenario 4: Owner/VIP Bypass
- Owner (polotuspossumus@gmail.com) can see ALL posts
- VIP list members can see ALL posts
- Regular users follow visibility rules

## Database Inspection

### Open Prisma Studio
```bash
npx prisma studio
```

Opens GUI at `http://localhost:5555`

### Query Database Directly
```bash
# Connect to PostgreSQL
docker exec -it fortheweebs-postgres psql -U fortheweebs -d fortheweebs

# Check users
SELECT id, email, username, tier, "isOwner" FROM "User";

# Check posts
SELECT id, "authorId", body, visibility, "isPaid" FROM "Post";

# Check subscriptions
SELECT "subscriberId", "creatorId", status, "priceCents" FROM "Subscription";
```

## Common Issues

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database Connection Failed
```bash
# Check containers
docker ps

# Restart containers
docker-compose restart

# Check logs
docker-compose logs postgres
```

### Prisma Client Not Generated
```bash
npx prisma generate
npx prisma db push
```

### CORS Errors
- Check `main.ts` has correct origins
- Verify frontend URL matches CORS config
- Check browser console for specific error

## Production Deployment

### Environment Variables Needed
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="long-random-string"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="https://fortheweebs.netlify.app"
PORT=3001
```

### Deploy to Railway
1. Create Railway account
2. New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy

### Deploy to Render
1. Create Render account
2. New Web Service → Connect GitHub
3. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start Command: `npm start`
5. Add PostgreSQL database
6. Set environment variables
