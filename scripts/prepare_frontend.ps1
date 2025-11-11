# Prepares a frontend-only export for pushing to GitHub (e.g., GitHub Pages)
# Usage examples:
#   pwsh scripts/prepare_frontend.ps1
#   pwsh scripts/prepare_frontend.ps1 -OutDir dist_frontend -IncludeCNAME -CNAME "your-domain.com"

param(
  [string]$OutDir = "dist_frontend",
  [switch]$IncludeCNAME,
  [string]$CNAME = ""
)

Write-Host "Preparing frontend export to '$OutDir'..." -ForegroundColor Cyan

# Ensure output directory is clean
if (Test-Path $OutDir) {
  Remove-Item -Recurse -Force $OutDir
}
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Files and directories to include
$rootFiles = @(
  'index.html',
  'catalog.html',
  'product.html',
  'kontak.html',
  'profile.html',
  '404.html',
  'robots.txt',
  'README.md'
)

$includeDirs = @(
  'assets',
  'foto',
  'produk'
)

# Copy root files if they exist
foreach ($f in $rootFiles) {
  if (Test-Path $f) {
    Copy-Item $f -Destination (Join-Path $OutDir $f) -Force
  }
}

# Copy included directories
foreach ($d in $includeDirs) {
  if (Test-Path $d) {
    Copy-Item $d -Destination (Join-Path $OutDir $d) -Recurse -Force
  }
}

# Exclusions: backend/API, local data, scripts not needed client-side
$excludeDirs = @('api', 'data', 'scripts')
foreach ($ex in $excludeDirs) {
  $target = Join-Path $OutDir $ex
  if (Test-Path $target) {
    Remove-Item -Recurse -Force $target
  }
}

# Optional CNAME for GitHub Pages custom domain
if ($IncludeCNAME.IsPresent -and $CNAME -ne "") {
  $cnamePath = Join-Path $OutDir 'CNAME'
  Set-Content -Path $cnamePath -Value $CNAME -Encoding ASCII
  Write-Host "Created CNAME with domain '$CNAME'" -ForegroundColor Green
}

# Deployment note
$note = @'
This folder contains a frontend-only export suitable for GitHub Pages.

Contains:
- HTML pages
- assets/, foto/, produk/ static files

Excludes:
- api/ (server-side PHP)
- data/ (local JSON samples)
- scripts/ (deployment helpers)

Notes:
- Update assets/config.js with your Supabase URL and ANON KEY before pushing.
- If using a custom domain, include a CNAME file with your domain name.
'@
Set-Content -Path (Join-Path $OutDir 'DEPLOY_NOTE.txt') -Value $note -Encoding UTF8

Write-Host "Frontend export ready at '$OutDir'." -ForegroundColor Cyan