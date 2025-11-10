# 🎌 ForTheWeebs - Professional Creator Platform

[![CI/CD](https://github.com/polotuspossumus-coder/Fortheweebs/actions/workflows/ci.yml/badge.svg)](https://github.com/polotuspossumus-coder/Fortheweebs/actions)
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/fortheweebs/deploys)

**The ultimate creator platform designed specifically for the anime community.**

🌐 **Live Site:** [https://fortheweebs.netlify.app](https://fortheweebs.netlify.app)

---

## ✨ Features

### 🎨 Creator Tools
- **Audio Studio** - Professional audio editing and mixing
- **Comic Creator** - Panel layouts, speech bubbles, and effects
- **Graphic Design** - Templates and design tools
- **Photo Tools** - Advanced image manipulation and AI enhancement
- **VR/AR Studio** - Immersive content creation

### 💎 Platform Features
- 🔐 Secure authentication with QR code admin access
- 💳 Stripe payment integration with subscription management
- 📊 Project management with auto-save (every 30 seconds)
- 🎨 Dark/Light theme toggle
- ⌨️ Keyboard shortcuts for power users
- 📤 Export projects in multiple formats (PNG, JPG, JSON, PDF)
- 🔗 Social sharing (Twitter, Facebook, Reddit)
- 📱 Fully responsive design
- 🎓 Interactive onboarding tour for new users
- 📈 Analytics tracking and error monitoring
- 🎭 Comprehensive error boundaries and fallback UIs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Stripe account (test mode)
- OpenAI API key (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/polotuspossumus-coder/Fortheweebs.git
cd Fortheweebs

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Authentication
JWT_SECRET=your-secret-key

# Analytics (optional)
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### Netlify Environment Variables

Set these in your Netlify dashboard (Site settings → Environment variables):
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

---

## 📦 Build & Deploy

### Local Build
```bash
npm run build
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

The site automatically deploys on every push to `main` branch.

---

## 🗄️ Database Setup

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Open SQL Editor
3. Run the contents of `supabase-setup.sql`

This creates all necessary tables:
- `users` - User profiles and subscriptions
- `projects` - Creator projects
- `assets` - Uploaded files
- `subscriptions` - Stripe subscription data
- `payments` - Payment history

---

## 💳 Stripe Setup

### 1. Create Products
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Create "VIP Membership" product
3. Set price to $9.99/month (recurring)
4. Copy the Price ID and add to environment variables

### 2. Configure Webhook
1. Go to Developers → Webhooks
2. Add endpoint: `https://fortheweebs.netlify.app/.netlify/functions/stripe-webhook`
3. Select events to listen for (all payment and subscription events)
4. Copy the signing secret and add to environment variables

### 3. Test Cards
Use these cards in test mode:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Auth required: `4000 0025 0000 3155`

---

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save project
- `Ctrl/Cmd + E` - Export project
- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Shift + ?` - Show help

---

## 📊 Analytics & Monitoring

### Google Analytics
Replace `G-XXXXXXXXXX` in `index.html` with your GA4 measurement ID.

### Sentry Error Tracking
1. Create account at [sentry.io](https://sentry.io)
2. Get your DSN
3. Add to environment variables as `VITE_SENTRY_DSN`

---

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Run linter
npm run lint
```

---

## 📁 Project Structure

```
Fortheweebs/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Toast.jsx          # Notification system
│   │   ├── ThemeToggle.jsx    # Dark/light mode
│   │   ├── LoadingSpinner.jsx # Loading states
│   │   ├── ShareButton.jsx    # Social sharing
│   │   ├── OnboardingTour.jsx # User tutorial
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   │   ├── useAutoSave.js     # Auto-save functionality
│   │   ├── useKeyboardShortcuts.js
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   ├── ExportUtils.js     # Export functionality
│   │   ├── analytics.js       # Analytics wrapper
│   │   ├── sentry.js          # Error tracking
│   │   └── ...
│   ├── index.jsx        # Main app entry point
│   └── CreatorDashboard.jsx
├── public/              # Static assets
├── dist/                # Build output
├── .github/
│   └── workflows/
│       └── ci.yml       # CI/CD pipeline
├── index.html           # Landing page
├── supabase-setup.sql   # Database schema
├── package.json
└── vite.config.mjs     # Vite configuration
```

---

## 🎯 Roadmap

- [ ] Mobile apps (iOS & Android)
- [ ] Collaboration features (real-time editing)
- [ ] Marketplace for templates and assets
- [ ] AI-powered content suggestions
- [ ] Advanced analytics dashboard
- [ ] Custom domain support
- [ ] API for third-party integrations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support

- **Discord:** [Join our community](#)
- **Email:** support@fortheweebs.com
- **Twitter:** [@ForTheWeebs](#)
- **Issues:** [GitHub Issues](https://github.com/polotuspossumus-coder/Fortheweebs/issues)

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev) and [Vite](https://vitejs.dev)
- Hosted on [Netlify](https://netlify.com)
- Database by [Supabase](https://supabase.com)
- Payments by [Stripe](https://stripe.com)
- Fonts by [Google Fonts](https://fonts.google.com)

---

**Made with 💜 for the anime community**

© 2025 ForTheWeebs - Empowering Creators Worldwide
