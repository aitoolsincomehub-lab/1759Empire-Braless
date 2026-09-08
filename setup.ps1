$ErrorActionPreference = "Stop"
Write-Host "1759 Empire setup" -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js LTS is required." -ForegroundColor Yellow
  exit 1
}
npm install
if (-not (Test-Path ".env.local")) { Copy-Item ".env.example" ".env.local" }
Write-Host "Setup complete. Run: npm run dev" -ForegroundColor Green
