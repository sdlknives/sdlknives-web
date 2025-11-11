Param(
  [Parameter(Mandatory=$true)] [string]$BaseUrl,
  [string]$Root = ".",
  [string]$OutZip = "deploy.zip"
)

Write-Host "Generating sitemap.xml for $BaseUrl" -ForegroundColor Cyan
python "$Root/scripts/generate_sitemap.py" --base $BaseUrl --root $Root --out "$Root/sitemap.xml"

if (!(Test-Path "$Root/sitemap.xml")) {
  Write-Error "sitemap.xml generation failed"; exit 1
}

Write-Host "Creating deployment zip: $OutZip" -ForegroundColor Cyan

# Files to include (exclude dev-only)
$exclude = @(
  ".git", ".gitignore", "scripts", "node_modules"
)

Compress-Archive -Path (Get-ChildItem -Path $Root -Force | Where-Object { $_.Name -notin $exclude }) -DestinationPath $OutZip -Force

Write-Host "Done. Upload $OutZip to your hosting (cPanel/Plesk)." -ForegroundColor Green

# Usage:
#   pwsh scripts/deploy.ps1 -BaseUrl https://your-domain.com -Root . -OutZip deploy.zip