<#
Starts the Vite dev server from the repository root, opens the browser to http://localhost:5173,
waits for the dev server to respond, and prints the result.

Usage (from any folder):
  pwsh .vscode\start_dev_and_probe.ps1
#>

param(
  [int]$Port = 5173,
  [int]$TimeoutSeconds = 60
)

$repoRoot = (Resolve-Path "..\").ProviderPath
Write-Host "Repository root: $repoRoot"

# Start dev server in a new window so it continues running
$startInfo = @{ 
  FilePath = 'powershell.exe'
  ArgumentList = "-NoProfile","-Command","cd `"$repoRoot`"; npm run dev"
  WorkingDirectory = $repoRoot
  WindowStyle = 'Normal'
}

Write-Host "Starting dev server (npm run dev) in new PowerShell window..."
Start-Process @startInfo | Out-Null

# Open browser (Start-Process will use default browser)
$devUrl = "http://localhost:$Port/"
Start-Process $devUrl

# Probe loop
$end = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $end) {
  try {
    $r = Invoke-WebRequest -Uri $devUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "SUCCESS: Dev server responded with status $($r.StatusCode)"
    exit 0
  } catch {
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 1
  }
}

Write-Host "ERROR: Dev server did not respond at $devUrl after $TimeoutSeconds seconds."
exit 2
