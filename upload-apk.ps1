Write-Host "📤 Uploading APK to Google Play..."

# Set Google Play credentials environment variable
$env:GOOGLE_PLAY_CREDENTIALS = "play-credentials.json"

# Install fastlane globally
npm install -g fastlane

# Change to android directory
Set-Location android

# Upload APK using fastlane
fastlane supply --apk app/build/outputs/apk/debug/app-debug.apk --track internal --json_key ../$env:GOOGLE_PLAY_CREDENTIALS

Write-Host "✅ APK uploaded to Google Play internal track."
