# ForTheWeebs Backend API

Complete friend/follow/subscribe system with visibility controls and monetization.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Social Relationships**:
  - Follow/unfollow users (one-way)
  - Send/accept/decline friend requests (mutual)
  - Track followers, following, friends
- **Subscriptions**: 
  - Stripe integration for paid subscriptions
  - Multiple tiers (BASIC, PREMIUM, VIP)
  - Webhook handling for payment events
- **Posts with Visibility**:
  - PUBLIC: Everyone
  - FRIENDS: Friends only
  - SUBSCRIBERS: Paid subscribers only
  - CUSTOM: Custom user lists
- **Stats Dashboard**: Real-time counts for friends, followers, subscribers, revenue

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Setup PostgreSQL database**:
```bash
# Install PostgreSQL locally or use Docker
docker run --name fortheweebs-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your database URL, JWT secret, and Stripe keys
```

4. **Run Prisma migrations**:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Start development server**:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /v1/auth/signup` - Create account
- `POST /v1/auth/login` - Login with email/username and password
- `GET /v1/auth/me` - Get current user info

### Relationships
- `POST /v1/users/:id/follow` - Follow/unfollow user
- `GET /v1/users/:id/followers` - Get followers
- `GET /v1/users/:id/following` - Get following list
- `POST /v1/users/:id/friend-requests` - Send friend request
- `POST /v1/friend-requests/:id/accept` - Accept friend request
- `POST /v1/friend-requests/:id/decline` - Decline friend request
- `GET /v1/users/:id/friends` - Get friends list

### Subscriptions
- `POST /v1/users/:id/subscriptions` - Create Stripe checkout session
- `GET /v1/users/:id/subscriptions/me` - Get subscription status
- `GET /v1/subscriptions/my-subscriptions` - List my subscriptions
- `GET /v1/subscriptions/my-subscribers` - List my subscribers
- `POST /v1/webhooks/stripe` - Stripe webhook handler

### Posts
- `POST /v1/posts` - Create post with visibility rules
- `GET /v1/posts/feed` - Get personalized feed (respects visibility)
- `GET /v1/posts/:id` - Get single post (checks access)
- `GET /v1/users/:id/posts` - Get user's posts (filtered by access)
- `POST /v1/posts/:id/like` - Like a post
- `DELETE /v1/posts/:id` - Delete post (author only)

### Stats
- `GET /v1/users/:id/stats` - Get social stats (friends, followers, subscribers)
- `GET /v1/users/:id/revenue` - Get revenue stats (creator only)
- `GET /v1/dashboard/stats` - Get complete dashboard stats

## Database Schema

See `prisma/schema.prisma` for complete schema with:
- Users
- Friendships (mutual, status-based)
- Follows (one-way)
- Subscriptions (Stripe-powered)
- Posts (visibility-controlled)
- Custom lists

## Visibility Logic

Post visibility is enforced server-side in `posts.service.ts`:

1. **PUBLIC**: Always visible
2. **FRIENDS**: Requires accepted friendship
3. **SUBSCRIBERS**: Requires active subscription
4. **CUSTOM**: Requires membership in custom list

Owner and LIFETIME_VIP users bypass all restrictions.

## Events

Real-time events emitted for:
- `user.followed` / `user.unfollowed`
- `friend.requested` / `friend.accepted`
- `subscription.activated` / `subscription.canceled`
- `post.created`

Use these events to trigger WebSocket notifications, update counters, etc.

## Stripe Integration

1. Get Stripe keys from https://dashboard.stripe.com/apikeys
2. Set up webhook endpoint at `/v1/webhooks/stripe`
3. Handle `checkout.session.completed` event to activate subscriptions
4. Use webhook secret to verify signatures

## Development

```bash
# Run development server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Next Steps

- [ ] Add WebSocket gateway for real-time notifications
- [ ] Implement Redis caching for entitlements
- [ ] Add pagination to all list endpoints
- [ ] Create custom lists management endpoints
- [ ] Add messaging system integration
- [ ] Implement video calling with WebRTC signaling
