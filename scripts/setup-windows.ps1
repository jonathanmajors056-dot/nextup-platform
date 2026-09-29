$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js 22 or newer is required. Install it from https://nodejs.org/ and run this script again."
  }

  $nodeVersion = (node --version).Trim()
  $major = [int](($nodeVersion -replace "^v", "").Split(".")[0])
  if ($major -lt 22) {
    throw "NextUp requires Node.js 22 or newer. Found $nodeVersion."
  }

  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm was not found. Reinstall Node.js 22 or open a new PowerShell window."
  }

  Write-Host "Installing NextUp dependencies..."
  & npm install

  & (Join-Path $PSScriptRoot "init-local.ps1")

  Write-Host ""
  Write-Host "NextUp is set up. Start it with: .\scripts\start-dev.ps1"
} finally {
  Pop-Location
}
