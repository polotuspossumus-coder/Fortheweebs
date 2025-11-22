# 🚀 Quick Start - ForTheWeebs

## For Polotus (You)

### Your Admin Credentials
```
Username: polotuspossumus
Password: Scorpio#96
```

### Start the App (Development)

```bash
# Open terminal in project folder
cd C:\Users\polot\OneDrive\Desktop\fortheweebs

# Start both frontend and backend
npm run dev:all
```

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:3001
**Mico Admin Panel:** http://localhost:3001/mico (password: `Fuckit#96`)

### What Works Right Now

✅ **Payments** - Stripe fully configured, all tiers working
✅ **Database** - Supabase connected and ready
✅ **File Storage** - Firebase configured
✅ **Admin Panel** - Login with your credentials above
✅ **AI Assistant (Mico)** - Claude API connected
✅ **Bug Reporter** - Auto-triages bugs with AI
✅ **Content Upload** - Images, videos, 3D models
✅ **Tier System** - $50-$1000/month subscriptions
✅ **Build System** - Production builds work

### What Needs Your Action

1. **Set Your Owner User ID** (for 0% platform fees):
   - Go to https://supabase.com/dashboard
   - Open your project → Table Editor → `users` table
   - Find your account row, copy the `id` column (UUID)
   - Edit `.env` file, set: `OWNER_USER_ID=your-uuid-here`

2. **Test Payments**:
   - Use Stripe test cards: `4242 4242 4242 4242`
   - Any future expiry date, any CVC

3. **Deploy** (when ready):
   - Push to GitHub (already set up)
   - Deploy to Vercel/Netlify/Railway
   - Point your domain

### Common Commands

```bash
# Development
npm run dev:all          # Start everything
npm run dev              # Frontend only
npm run dev:server       # Backend only

# Production
npm run build            # Build for production
npm run server           # Start production server

# Mobile
npm run android:build    # Build Android app
npm run android:release  # Build signed release APK
```

### File Structure

```
src/
├── components/          React UI components
├── routes/             Backend API endpoints
├── utils/              Helper functions
api/                    Payment & tier APIs
server.js               Main backend server
.env                    Configuration (DON'T COMMIT THIS)
```

### Need Help?

- **Server Logs**: Check terminal for errors
- **Database**: Supabase dashboard
- **Payments**: Stripe dashboard
- **Mico Admin**: http://localhost:3001/mico

### Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000 or 3001
npx kill-port 3000 3001
```

**Build fails?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database errors?**
- Check Supabase connection in `.env`
- Make sure SQL tables are created (see `archive/sql/`)

---

**You're all set!** Run `npm run dev:all` and start building. 🎉
