# Backend Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Docker)
- Stripe account for payments

## Quick Start

### 1. Start Database

**Option A: Docker (Recommended)**
```bash
cd server
docker-compose up -d
```

**Option B: Local PostgreSQL**
- Install PostgreSQL
- Create database: `createdb fortheweebs`

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://fortheweebs:fortheweebs_password@localhost:5432/fortheweebs?schema=public"
JWT_SECRET="generate-random-secret-here"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:5173"
PORT=3001
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start Server

```bash
npm run dev
```

Server runs at `http://localhost:3001`

## API Documentation

### Authentication

**Signup**
```bash
curl -X POST http://localhost:3001/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "password123",
    "displayName": "Display Name"
  }'
```

**Login**
```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "user@example.com",
    "password": "password123"
  }'
```

Returns: `{ user: {...}, token: "jwt_token" }`

**Get Current User**
```bash
curl http://localhost:3001/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Relationships

**Follow User**
```bash
curl -X POST http://localhost:3001/v1/users/USER_ID/follow \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Send Friend Request**
```bash
curl -X POST http://localhost:3001/v1/users/USER_ID/friend-requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Accept Friend Request**
```bash
curl -X POST http://localhost:3001/v1/friend-requests/REQUEST_ID/accept \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Subscriptions

**Create Subscription Checkout**
```bash
curl -X POST http://localhost:3001/v1/users/CREATOR_ID/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "BASIC",
    "priceCents": 100000
  }'
```

Returns Stripe checkout URL.

### Posts

**Create Post**
```bash
curl -X POST http://localhost:3001/v1/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Post content",
    "visibility": "PUBLIC",
    "isPaid": false
  }'
```

Visibility options: `PUBLIC`, `FRIENDS`, `SUBSCRIBERS`, `CUSTOM`

**Get Feed**
```bash
curl http://localhost:3001/v1/posts/feed?limit=50&offset=0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Stats

**Get User Stats**
```bash
curl http://localhost:3001/v1/users/USER_ID/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Returns:
```json
{
  "friendsCount": 10,
  "followersCount": 50,
  "followingCount": 30,
  "subscribersCount": 5,
  "subscriptionsCount": 3,
  "postsCount": 100
}
```

## Stripe Webhook Setup

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks:
```bash
stripe listen --forward-to localhost:3001/v1/webhooks/stripe
```
4. Copy webhook secret to `.env`

## Database Management

**View Database**
```bash
npx prisma studio
```

Opens GUI at `http://localhost:5555`

**Create Migration**
```bash
npx prisma migrate dev --name description
```

**Reset Database**
```bash
npx prisma migrate reset
```

## Deployment

### Netlify Functions (Serverless)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

### Railway (Traditional Server)

1. Create Railway account
2. Connect GitHub repo
3. Add PostgreSQL addon
4. Set environment variables
5. Deploy automatically on push

## Frontend Integration

Update `src/utils/api.js` endpoint:
```javascript
const API_BASE_URL = 'https://your-api-domain.com/v1';
```

## Troubleshooting

**Port already in use**
```bash
# Change PORT in .env or kill process:
lsof -ti:3001 | xargs kill
```

**Database connection failed**
- Check PostgreSQL is running: `docker ps`
- Verify DATABASE_URL in `.env`

**Prisma errors**
```bash
npx prisma generate
npx prisma db push
```

## Next Steps

- [ ] Wire frontend SocialFeed to use API
- [ ] Add WebSocket for real-time notifications
- [ ] Implement Redis caching for entitlements
- [ ] Add rate limiting
- [ ] Set up monitoring (Sentry, DataDog)
