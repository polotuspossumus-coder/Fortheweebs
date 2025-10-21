Write-Host "📤 Uploading IPA to Apple App Store..."

# Change to ios directory
Set-Location ios

# Archive the app
xcodebuild -workspace App.xcworkspace -scheme App -archivePath App.xcarchive archive

# Export the IPA
xcodebuild -exportArchive -archivePath App.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath ./build

# Upload the IPA to App Store Connect
xcrun altool --upload-app --type ios --file ./build/App.ipa --username "your@apple.id" --password "app-specific-password"

Write-Host "✅ IPA uploaded to App Store Connect."
