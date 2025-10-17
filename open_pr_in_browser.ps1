<#
Opens the PR creation page for the pushed branch in your default browser.
It constructs the URL using the Git remote origin URL and the current branch.
Run from the repo root or the .vscode folder.
#>

# Find git repo root
$gitRoot = (git rev-parse --show-toplevel) 2>$null
if (-not $gitRoot) {
  Write-Host "Error: not in a git repo or git not available."
  exit 2
}

# Get remote URL and current branch
$remoteUrl = git config --get remote.origin.url
$branch = git rev-parse --abbrev-ref HEAD
if (-not $remoteUrl) {
  Write-Host "Error: could not find remote.origin.url"
  exit 2
}

# Normalize remote url (support git@ and https)
if ($remoteUrl -match '^git@([^:]+):(.+).git$') {
  $gitHost = $matches[1]
  $path = $matches[2]
  $webUrl = "https://$gitHost/$path"
} else {
  $webUrl = $remoteUrl -replace '\.git$',''
}

$prUrl = "$webUrl/pull/new/$branch"
Write-Host "Opening PR page: $prUrl"
Start-Process $prUrl
