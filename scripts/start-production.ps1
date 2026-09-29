$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
  if (-not (Test-Path (Join-Path $repoRoot "node_modules"))) {
    throw "Dependencies are not installed. Run .\scripts\setup-windows.ps1 first."
  }

  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "NextUp production build failed." }
  & npm run start
} finally {
  Pop-Location
}
