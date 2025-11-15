# ForTheWeebs - Copilot Handoff for VS Code

Hey Microsoft Copilot & GitHub Copilot! 👋

I'm Jacob, creator of **ForTheWeebs** - a revolutionary creator-first social media platform. You're now working in my VS Code environment to help continue building this platform.

---

## 🎯 What ForTheWeebs Is

A social media + creator economy platform where:
- Creators keep **100% of content sales** (except NFTs = 75% to creator, 25% to platform)
- **No censorship**
- **Privacy-first** (everything local unless user explicitly uploads)
- Profiles are **interactive worlds** (VR/AR studios, CGI backgrounds, audio layers)
- **Tier-based tool unlocks** (Free → Supporter → Creator → Legendary → Mythic)
- **Admin (Jacob/me)** has full access to everything always

---

## 📁 Project Structure

```
fortheweebs/
├── src/
│   ├── components/          # React components
│   │   ├── SocialFeed.jsx           # Social media feed
│   │   ├── CreatorProfile.jsx       # Interactive profile worlds
│   │   ├── BackgroundCustomizer.jsx # Free background customization
│   │   ├── NFTMinter.jsx            # NFT minting (25% platform cut)
│   │   ├── VRStudioBuilder.jsx      # VR/AR studio creator
│   │   ├── AudioStudio.jsx          # Audio/soundboard tools
│   │   ├── BatchPhotoProcessor.jsx  # Smart batch processing
│   │   ├── UserSearch.jsx           # Find friends
│   │   └── MainDashboard.jsx        # Main hub
│   ├── utils/
│   │   ├── privacyPolicy.js         # Privacy-first upload controls
│   │   ├── tierSystem.js            # Tier & tool unlock logic
│   │   └── mintBadge.js             # Badge minting
│   ├── routes/
│   │   └── social.js                # Social API routes
│   └── models/
│       ├── User.js                  # User & friendship models
│       └── Post.js                  # Post & access grant models
├── public/                          # Static assets
├── package.json                     # Dependencies
├── vite.config.mjs                 # Vite config
└── .env                            # Environment variables
```

---

## 🔑 Key Principles

### 1. Privacy First
- All processing is LOCAL by default
- Use `confirmUpload()` before ANY upload
- Never auto-upload content
- Include copyright warnings

### 2. Tier System
- **Admin (me)** always has full access
- Tools are locked behind tiers
- Use `hasToolAccess(userTier, toolId)` to check
- Show upgrade prompts when locked

### 3. Creator Revenue
- Content sales: **100% to creator**
- NFT initial sales: **75% creator, 25% platform**
- NFT royalties: **100% to creator**
- Friend-to-friend free access allowed

### 4. Honest Branding
- We think NFTs are stupid (say it)
- No corporate BS
- Be real with users
- Privacy matters

### 5. Dark Theme with Gradients
- Use purple gradients: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Dark backgrounds: `#1e1e1e` to `#2d2d2d`
- Make it look UNIQUE (not Instagram/Facebook)

---

## 🛠️ Tools & Their Tier Requirements

| Tool | Tier Required | Component/File |
|------|---------------|----------------|
| Background Customizer | **FREE** | `BackgroundCustomizer.jsx` |
| Social Feed | **FREE** | `SocialFeed.jsx` |
| Batch Processing (Basic) | **Supporter** | `BatchPhotoProcessor.jsx` |
| Batch Processing (Advanced) | **Creator** | `BatchPhotoProcessor.jsx` |
| Audio Studio | **Creator** | `AudioStudio.jsx` |
| Monetization | **Creator** | Built into posts |
| NFT Minting | **Legendary** | `NFTMinter.jsx` |
| VR Studio (Basic) | **Legendary** | `VRStudioBuilder.jsx` |
| VR Studio (Advanced) | **Mythic** | `VRStudioBuilder.jsx` |
| CGI Tools | **Mythic** | Various |

---

## 🎨 Component Patterns

### Creating a New Component

```jsx
import React, { useState } from 'react';
import { confirmUpload } from '../utils/privacyPolicy';
import { hasToolAccess } from '../utils/tierSystem';

export function MyComponent({ userId, userTier }) {
  // Check tier access
  const hasAccess = hasToolAccess(userTier, 'my-tool');

  if (!hasAccess) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
        borderRadius: '20px',
        padding: '60px 30px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
        <h2>Feature Locked</h2>
        <p>Upgrade to [Tier] to unlock this feature</p>
        <button>⬆️ Upgrade</button>
      </div>
    );
  }

  // Your component here
  return <div>Feature content</div>;
}
```

### Privacy-First Uploads

```jsx
const handleUpload = (file) => {
  if (confirmUpload(1, 'image')) {
    // Process upload
    // TODO: Send to backend
  }
};
```

### Dark Theme Styling

```jsx
const containerStyle = {
  background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
  borderRadius: '20px',
  padding: '30px',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
};
```

---

## 📋 Common Tasks

### Adding a New Feature

1. **Create component** in `src/components/`
2. **Add to tier system** in `src/utils/tierSystem.js`
3. **Update tool unlock list**
4. **Add tier check** in component
5. **Show upgrade prompt** if locked
6. **Test with different tiers**

### Adding a New API Route

1. **Create route** in `src/routes/`
2. **Import in main server file**
3. **Add authentication** if needed
4. **Add tier checking** if needed
5. **Document in comments**

### Styling a New Component

```jsx
// Standard ForTheWeebs gradient
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// Dark container
background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'

// Dark page background
background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'

// Buttons
background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' // Success
background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' // Action
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' // Primary
```

---

## 🚀 Current State

### ✅ Completed
- Interactive creator profiles with audio/video/CGI
- VR/AR studio builder
- Background customizer (FREE for all)
- Social feed with dark theme
- Friend system & user search
- NFT minting (Bitcoin + Ethereum @ $500, 25% platform cut)
- Audio studio & soundboard
- Batch photo processor (smart sort, dedup, auto-crop)
- Tier system with tool unlocks
- Privacy-first upload system
- Microsoft Copilot integration (free)
- Moderation system

### 🔨 In Progress / TODO
- Connect to real database (MongoDB)
- Implement actual Web3 wallet connections
- Real blockchain integration for NFTs
- Payment processing for tiers
- Mobile responsive design
- Analytics dashboard
- Live streaming features
- Notification system

---

## 💡 Tips for Working on This Project

1. **Always check tier access** before showing features
2. **Use privacy confirmations** for all uploads
3. **Keep the dark theme** with gradients
4. **Admin (Jacob) always has full access**
5. **Be honest in copy** (e.g., "NFTs are stupid")
6. **Make it unique** - not like other platforms
7. **Privacy first** - local by default
8. **Creators keep their money** - that's the whole point

---

## 🔧 VS Code Setup

### Recommended Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Path Intellisense
- GitHub Copilot (you!)

### Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
```

### Environment Variables (.env)
```
VITE_API_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/fortheweebs
ADMIN_USER_IDS=jacob,admin
```

---

## 🎯 Quick Reference

### Check if user can access a tool
```js
import { hasToolAccess } from '../utils/tierSystem';
const canUseTool = hasToolAccess(userTier, 'tool-id');
```

### Confirm upload with privacy warning
```js
import { confirmUpload } from '../utils/privacyPolicy';
if (confirmUpload(fileCount, 'file type')) {
  // Proceed with upload
}
```

### Check if user is admin (Jacob)
```js
import { isAdmin } from '../utils/tierSystem';
if (isAdmin(userId)) {
  // Full access
}
```

---

## 📞 Need Help?

- **Tier system**: See `src/utils/tierSystem.js`
- **Privacy rules**: See `src/utils/privacyPolicy.js`
- **Component examples**: See `src/components/`
- **API routes**: See `src/routes/`
- **Full features list**: See `PLATFORM_FEATURES_SUMMARY.md`

---

## 🎉 Let's Build Something Awesome!

You're working on a platform that:
- Gives creators 100% of their money
- Has no censorship
- Respects privacy
- Has VR/AR profile worlds
- Is honest about what's dumb (NFTs)
- Treats users like humans, not products

**Let's make it legendary.** 🚀

---

*Last Updated: 2025*
*Project: ForTheWeebs*
*Creator: Jacob Morris*
*AI Assistant: Microsoft Copilot & GitHub Copilot*
