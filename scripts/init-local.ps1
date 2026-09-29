$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$dataPath = Join-Path $repoRoot "data"

New-Item -ItemType Directory -Force -Path $dataPath | Out-Null

$envPath = Join-Path $repoRoot ".env.local"
$envExamplePath = Join-Path $repoRoot ".env.example"
if (-not (Test-Path $envPath) -and (Test-Path $envExamplePath)) {
  Copy-Item $envExamplePath $envPath
  Write-Host "Created .env.local from .env.example. Add production credentials before deploying."
}

Write-Host "NextUp local persistence is ready at $dataPath"
Write-Host "The fallback store creates data/nextup.json after the first local save or submission."
