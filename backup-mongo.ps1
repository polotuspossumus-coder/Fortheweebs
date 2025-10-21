$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$backupDir = ".\backups\mongo_$timestamp"
mongodump --db vanguard --out $backupDir
Write-Host "✅ MongoDB backup completed: mongo_$timestamp"
