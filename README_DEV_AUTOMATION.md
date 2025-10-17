This folder contains automation helpers I added so I can operate even when the VS Code workspace is rooted at `.vscode`.

Available scripts

- `start_dev_and_probe.ps1`
  - Starts the dev server (npm run dev) in a new PowerShell window, opens the browser to `http://localhost:5173`, and waits up to 60s for the server to respond.
  - Run: `pwsh .vscode\start_dev_and_probe.ps1`

- `open_pr_in_browser.ps1`
  - Opens the GitHub "create pull request" page for the current branch using the repo's `remote.origin.url`.
  - Run from the repo root (or `.vscode`): `pwsh .vscode\open_pr_in_browser.ps1`

- `ensure_dev_scripts.cjs`
  - Adds/updates repo-root `package.json` scripts (backups original to `package.json.backup-<ts>`).
  - Run: `node .vscode\ensure_dev_scripts.cjs`

- `probe_local.js`
  - Probes common dev URLs (3000, 5173) and prints success/failure. Used by `smoke:dev` script if added to the repo `package.json`.
  - Run: `node .vscode\probe_local.js`

Notes

- I updated the repo root `package.json` (a backup was created). If you'd like I can commit and push the change on your behalf, or you can review the backup file and accept.
- These scripts are intentionally conservative and non-destructive. If you'd prefer I stop adding automation helpers, say "stop helpers".
