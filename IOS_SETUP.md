# iOS Setup Guide for ForTheWeebs

## ✅ Completed Steps

### 1. Capacitor iOS Installation
- ✅ Installed `@capacitor/ios` package
- ✅ Generated iOS native project in `ios/` folder
- ✅ Created Xcode project structure

### 2. iOS Permissions Configuration
Updated `ios/App/App/Info.plist` with required permissions:
- ✅ **NSCameraUsageDescription**: Camera access for video recording and CGI effects
- ✅ **NSMicrophoneUsageDescription**: Microphone access for audio recording and video calls
- ✅ **NSPhotoLibraryUsageDescription**: Photo library access for media uploads
- ✅ **NSPhotoLibraryAddUsageDescription**: Permission to save photos/videos
- ✅ **ITSAppUsesNonExemptEncryption**: Set to false (no custom encryption)

### 3. App Configuration
- ✅ App ID: `com.fortheweebs.app`
- ✅ Display Name: `ForTheWeebs`
- ✅ Version: 1.0.0
- ✅ Supported Orientations: Portrait, Landscape (iPhone and iPad)

---

## 🔨 What You Need to Do

### Step 1: Install macOS & Xcode (Required)
iOS apps **must** be built on a Mac with Xcode:
1. **Get a Mac**: MacBook, iMac, or Mac Mini running macOS Ventura or later
2. **Install Xcode**: Download from Mac App Store (free, ~15GB)
3. **Install Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
4. **Install CocoaPods** (iOS dependency manager):
   ```bash
   sudo gem install cocoapods
   ```

### Step 2: Open Project in Xcode
```bash
cd c:\Users\polot\fortheweebs\Fortheweebs
npx cap open ios
```
This opens your iOS project in Xcode.

### Step 3: Configure Signing & Team
In Xcode:
1. Select **App** target in left sidebar
2. Go to **Signing & Capabilities** tab
3. Set **Team**: Select your Apple Developer account
4. **Bundle Identifier**: Should be `com.fortheweebs.app`
5. Check **Automatically manage signing**

### Step 4: Join Apple Developer Program ($99/year)
You mentioned your friend is paying for this. They need to:
1. Go to https://developer.apple.com/programs/
2. Sign up with their Apple ID
3. Pay $99/year (credit card required)
4. Wait for approval (1-2 days)
5. **Add you as a team member** (Settings → Membership → Add People)

### Step 5: Create App in App Store Connect
Once developer account is approved:
1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: ForTheWeebs
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.fortheweebs.app`
   - **SKU**: `fortheweebs-ios` (unique identifier)
   - **User Access**: Full Access

### Step 6: App Store Assets (YOU CREATE THESE)
You need to provide:

#### App Icon
- **1024x1024 PNG** (no transparency, no rounded corners)
- Use https://icon.kitchen/ or design your own
- Upload in Xcode: Assets.xcassets → AppIcon

#### Screenshots (iPhone)
- **6.7" Display** (iPhone 14 Pro Max): 1290 x 2796 pixels (3-10 images)
- **5.5" Display** (iPhone 8 Plus): 1242 x 2208 pixels (3-10 images)
- Take screenshots of:
  - Dashboard with CGI effects
  - Video call interface
  - Creator tools
  - Pricing page
  - Profile page

#### App Preview Video (Optional but recommended)
- **15-30 seconds** showing app features
- Same resolutions as screenshots
- Must show actual app functionality
- No third-party content or music

### Step 7: Fill Out App Store Listing
Use the descriptions from `STORE_LISTINGS.md`:
- **App Name**: ForTheWeebs (30 characters max)
- **Subtitle**: Create. Share. Earn. (30 characters max)
- **Description**: Copy from STORE_LISTINGS.md (4000 characters)
- **Keywords**: `anime,creator,cosplay,CGI,effects,video,streaming,art,subscription,monetize`
- **Support URL**: `https://fortheweebs.netlify.app`
- **Marketing URL**: `https://fortheweebs.netlify.app`
- **Privacy Policy URL**: `https://fortheweebs.netlify.app/privacy`
- **Category**: Photo & Video (Primary), Entertainment (Secondary)
- **Age Rating**: 17+ (Frequent/Intense Mature/Suggestive Themes)

### Step 8: Build & Upload to App Store
In Xcode:
1. Select **Any iOS Device (arm64)** as target (not simulator)
2. Product → Archive (takes 5-15 minutes)
3. Once archive finishes, click **Distribute App**
4. Choose **App Store Connect**
5. Select **Upload**
6. Follow prompts to submit

### Step 9: Submit for Review
In App Store Connect:
1. Select your app version
2. Fill in **App Review Information**:
   - **First Name**: Your name
   - **Last Name**: Your last name
   - **Phone**: Your phone number
   - **Email**: Your email
   - **Demo Account**: Create a test account with full access
     - Username: `reviewer@fortheweebs.com` (create this in your system)
     - Password: `TestAccount2024!`
3. Add **Notes for Review**:
   ```
   ForTheWeebs is a creator platform for anime fans. Users can create accounts, 
   subscribe to tiers ($50-$1000/month), upload content with CGI effects, 
   and connect via video calls.

   This app is rated 17+ due to user-generated content that may include mature themes.
   We have age verification on first launch and content moderation systems.

   Test account provided has access to premium features.
   ```
4. Click **Submit for Review**

### Step 10: Wait for Review
- **Review Time**: 1-7 days (usually 2-3 days)
- **Status**: Check App Store Connect for updates
- Apple may request changes or ask questions
- Respond quickly to avoid delays

---

## 📋 Build Scripts

Add these to your `package.json`:

```json
"scripts": {
  "ios:build": "npm run build && npx cap sync ios",
  "ios:open": "npx cap open ios",
  "ios:run": "npm run ios:build && npx cap run ios",
  "ios:pod": "cd ios/App && pod install"
}
```

Run commands:
```bash
npm run ios:build    # Build web assets and sync to iOS
npm run ios:open     # Open Xcode
npm run ios:run      # Build and run on connected device/simulator
npm run ios:pod      # Install CocoaPods dependencies
```

---

## 🚨 Common Issues

### "CocoaPods not installed"
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

### "No signing identity found"
- Join Apple Developer Program first
- Add your Apple ID to Xcode (Preferences → Accounts)
- Select Team in Signing & Capabilities

### "Bundle ID already in use"
- Change bundle ID in `capacitor.config.ts` to something unique
- Update in Xcode: App target → General → Bundle Identifier

### "Build failed in Xcode"
```bash
# Clean build folder
cd ios/App
xcodebuild clean

# Reinstall pods
pod deintegrate
pod install
```

---

## 🎯 iOS vs Android Differences

| Feature | iOS | Android |
|---------|-----|---------|
| **Development OS** | macOS only | Windows/Mac/Linux |
| **IDE** | Xcode | Android Studio |
| **Deployment** | TestFlight, App Store | APK, Google Play |
| **Fee** | $99/year | $25 one-time |
| **Review Time** | 1-7 days | 2-3 hours |
| **Approval** | Strict (manual review) | Automated + spot checks |

---

## 📞 Next Steps After iOS Setup

1. ✅ **Age Gate** - Already added
2. ✅ **Store Descriptions** - Already written in STORE_LISTINGS.md
3. ✅ **iOS Permissions** - Already configured
4. ⏳ **Get a Mac** - Required to build iOS apps
5. ⏳ **Create App Icons** - Use icon.kitchen
6. ⏳ **Take Screenshots** - 6.7" and 5.5" iPhone displays
7. ⏳ **Apple Developer Account** - Friend pays $99
8. ⏳ **Build in Xcode** - Archive and upload
9. ⏳ **Submit for Review** - App Store Connect

---

## 🔗 Useful Links

- **Apple Developer**: https://developer.apple.com
- **App Store Connect**: https://appstoreconnect.apple.com
- **Xcode Download**: https://apps.apple.com/us/app/xcode/id497799835
- **Capacitor iOS Docs**: https://capacitorjs.com/docs/ios
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **TestFlight**: https://developer.apple.com/testflight/

---

**Status**: iOS project structure ready. Waiting on Mac access and Apple Developer account.
