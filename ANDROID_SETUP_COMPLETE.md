# ForTheWeebs Android App - Google Play Setup Guide

## ✅ Completed Setup

### 1. Capacitor Integration
- ✅ Installed Capacitor core, CLI, and Android platform
- ✅ Created `capacitor.config.ts` with app configuration
- ✅ Initialized Android native project in `/android` folder
- ✅ Added mobile touch optimizations for better responsiveness

### 2. Android Configuration
- ✅ Set app ID: `com.fortheweebs.app`
- ✅ Version: 1.0.0 (versionCode: 1)
- ✅ Added required permissions:
  - Camera (for face tracking/AR features)
  - Microphone (for video calls)
  - Storage (read/write media)
  - Internet & network state
- ✅ Configured for 18+ rating (Adults Only)

### 3. Build Scripts Added
```bash
npm run android:build    # Build web app and sync to Android
npm run android:open     # Open Android Studio
npm run android:run      # Build and run on device/emulator
npm run android:release  # Build signed APK for release
npm run android:bundle   # Build AAB for Google Play upload
```

---

## 📋 Next Steps (Do These Before Submitting)

### Step 1: Create App Icons (REQUIRED)
You need to create app icons in these sizes:
- **192x192** - Adaptive icon foreground
- **512x512** - High-res icon for Google Play
- **1024x1024** - Feature graphic

Place them in:
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png (48x48)
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
└── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

**Quick way:** Use https://icon.kitchen/ to generate all sizes from one image.

### Step 2: Build the App
```bash
# First build
npm run build

# Sync to Android
npm run android:build

# Test on device/emulator
npm run android:run
```

### Step 3: Create Signing Key (REQUIRED for release)
```bash
# Generate keystore
keytool -genkey -v -keystore fortheweebs-release.keystore -alias fortheweebs -keyalg RSA -keysize 2048 -validity 10000

# Store securely - you'll need this forever!
```

Update `android/app/build.gradle`:
```groovy
signingConfigs {
    release {
        storeFile file('fortheweebs-release.keystore')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'fortheweebs'
        keyPassword 'YOUR_PASSWORD'
    }
}
```

### Step 4: Build for Google Play
```bash
# Build AAB (Android App Bundle - required by Google Play)
npm run android:bundle

# Output will be in:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🏪 Google Play Submission Requirements

### 1. Google Play Console Setup
- Register at https://play.google.com/console ($25 one-time fee)
- Create new app
- Select "App" → "Create app"

### 2. App Details Required
- **App name:** ForTheWeebs
- **Short description:** (80 chars) "Creator platform for anime content with CGI effects, video calls, and AI tools"
- **Full description:** (4000 chars) - Explain features, 18+ content warning
- **Category:** Entertainment or Social
- **Content rating:** Adults only 18+ (select "User-Generated Content" + "Adult Content")

### 3. Store Listing Assets
- **Icon:** 512x512 PNG
- **Feature graphic:** 1024x500 PNG (banner)
- **Screenshots:** Minimum 2, max 8
  - Phone: 16:9 or 9:16 ratio
  - Tablet: 16:9 or 9:16 ratio (optional)
- **Privacy Policy URL:** https://fortheweebs.netlify.app/privacy (you have this!)
- **Terms of Service URL:** https://fortheweebs.netlify.app/tos (you have this!)

### 4. Content Rating Questionnaire
**Critical for 18+ app:**
- Select "User-Generated Content"
- Mark "Yes" for adult/sexual content
- Mark "Yes" for violence (if applicable)
- Google will assign "Adults only 18+" rating
- **This will limit visibility but keeps you compliant**

### 5. App Access
- Provide test account credentials (your owner account)
- Document how to access 18+ content for reviewers

---

## ⚠️ Important Notes

### Adult Content Policy
Google Play **allows** 18+ apps but with restrictions:
- ✅ Must be rated Adults Only (AO) - DONE
- ✅ Clear age gate on first launch - ADD THIS
- ✅ No explicit content in screenshots/listing
- ⚠️ Won't appear in search for users under 18
- ⚠️ Some countries may block the app entirely

### Recommended: Add Age Gate
Create a simple age verification screen that shows BEFORE login:
```jsx
// Add to index.jsx
if (!localStorage.getItem('ageVerified')) {
  // Show age gate modal
  // User must confirm they're 18+
  // Set localStorage.setItem('ageVerified', 'true')
}
```

### Testing Before Submission
1. **Internal Testing:** Upload AAB, add testers, get feedback
2. **Closed Testing:** Invite 10-50 users, test for 14+ days
3. **Open Testing:** Public beta (optional)
4. **Production:** Full release

---

## 🚀 Quick Start Commands

```bash
# Test local build
npm run dev

# Build production web app
npm run build

# Build Android app
npm run android:build

# Open in Android Studio (for debugging)
npm run android:open

# Build release AAB for Google Play
npm run android:bundle

# Find output here:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📱 What You Have Now

✅ **Native Android app shell** - Capacitor wraps your web app
✅ **Mobile optimizations** - Touch events, passive listeners, no zoom
✅ **18+ configuration** - Properly marked for adult content
✅ **All permissions** - Camera, mic, storage for your features
✅ **Build scripts** - Easy commands to generate APK/AAB

## ❌ What You Still Need

- [ ] App icons (all sizes)
- [ ] Signing keystore (for release builds)
- [ ] Screenshots for Google Play listing
- [ ] Age verification gate in app
- [ ] Google Play Console account ($25)
- [ ] Test the app on a real Android device

---

**Estimated time to first submission:** 1-2 days after creating icons and testing.

**Need help with any step? Just ask!**
