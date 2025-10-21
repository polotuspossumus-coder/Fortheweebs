Write-Host "🔁 Syncing legacy artifacts across platforms..."

# Ensure dist directory exists
if (!(Test-Path dist)) { New-Item -ItemType Directory -Path dist }

# Copy version.json and CHANGELOG.md to dist
Copy-Item version.json dist/ -Force
Copy-Item CHANGELOG.md dist/ -Force

# Copy to Android assets
if (!(Test-Path android/app/src/main/assets)) { New-Item -ItemType Directory -Path android/app/src/main/assets -Force }
Copy-Item version.json android/app/src/main/assets/ -Force
Copy-Item CHANGELOG.md android/app/src/main/assets/ -Force

# Copy to iOS App directory
if (!(Test-Path ios/App)) { New-Item -ItemType Directory -Path ios/App -Force }
Copy-Item version.json ios/App/ -Force
Copy-Item CHANGELOG.md ios/App/ -Force

Write-Host "✅ Artifact sync complete. All platforms updated with legacy metadata."
