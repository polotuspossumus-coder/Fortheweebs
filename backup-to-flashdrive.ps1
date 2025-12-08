# ForTheWeebs Flash Drive Backup Script
# Auto-syncs source code to D:\ flash drive

$source = "C:\Users\polot\Desktop\FORTHEWEEBS"
$destination = "D:\FORTHEWEEBS_BACKUP"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "Starting ForTheWeebs backup to flash drive..." -ForegroundColor Cyan
Write-Host "Source: $source" -ForegroundColor Gray
Write-Host "Destination: $destination" -ForegroundColor Gray
Write-Host ""

# Check if flash drive exists
if (-not (Test-Path "D:\")) {
    Write-Host "❌ Flash drive (D:) not found! Please insert flash drive." -ForegroundColor Red
    exit 1
}

# Create destination if it doesn't exist
if (-not (Test-Path $destination)) {
    New-Item -Path $destination -ItemType Directory -Force | Out-Null
    Write-Host "✅ Created backup directory: $destination" -ForegroundColor Green
}

Write-Host "Copying files..." -ForegroundColor Yellow

# Use robocopy for efficient syncing
robocopy $source $destination /MIR /R:1 /W:1 /MT:8 /XD "node_modules" ".git" "dist" "build" ".netlify" ".vercel" | Out-Null

Write-Host ""
Write-Host "Backup complete!" -ForegroundColor Green

# Create a timestamp file
"Backup created: $timestamp" | Out-File "$destination\LAST_BACKUP.txt"

# Show stats
$fileCount = (Get-ChildItem -Path $destination -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "Files backed up: $fileCount" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Gray


