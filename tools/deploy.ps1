# tools/deploy.ps1 — publica el prototipo en Netlify.
#
#   .\tools\deploy.ps1 -Token nfp_xxx
#   o con la variable de entorno:  $env:NETLIFY_AUTH_TOKEN = 'nfp_xxx'; .\tools\deploy.ps1
#
# Por qué no se usa `Compress-Archive`: en Windows escribe las entradas del zip con barras
# invertidas (`assets\tokens.css`). Netlify corre en Linux y lee eso como UN nombre de archivo,
# no como una ruta -> el sitio responde 200 en / y 404 en todo lo demás. Aquí se fuerzan '/'.
param(
  [string]$Token = $env:NETLIFY_AUTH_TOKEN,
  [string]$SiteId = ''
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $Token) { throw 'Falta el token: -Token <nfp_...> o define $env:NETLIFY_AUTH_TOKEN' }

Write-Host '[1/3] build + dist'
npm run build | Out-Null
node tools/dist.mjs

Write-Host '[2/3] empaquetando (rutas con /)'
$zipPath = Join-Path $root 'dist.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$base = (Resolve-Path (Join-Path $root 'dist')).Path
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
  Get-ChildItem -Path $base -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip, $_.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $zip.Dispose() }

Write-Host '[3/3] deploy'
$h = @{ Authorization = "Bearer $Token" }
if (-not $SiteId) {
  $f = Join-Path $root '.netlify-site-id'
  if (Test-Path $f) { $SiteId = (Get-Content $f -Raw).Trim() }
}
if (-not $SiteId) {
  $site = Invoke-RestMethod -Method Post -Uri 'https://api.netlify.com/api/v1/sites' `
    -Headers $h -ContentType 'application/json' -Body '{"name":"sitre-rallylatam"}'
  $SiteId = $site.id
  $SiteId | Out-File (Join-Path $root '.netlify-site-id') -NoNewline -Encoding ascii
}

$dep = Invoke-RestMethod -Method Post -Uri "https://api.netlify.com/api/v1/sites/$SiteId/deploys" `
  -Headers $h -ContentType 'application/zip' -InFile $zipPath
do {
  Start-Sleep -Seconds 3
  $d = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$SiteId/deploys/$($dep.id)" -Headers $h
} while ($d.state -in @('uploaded', 'processing', 'enqueued', 'new'))

Write-Host "estado: $($d.state)"
Write-Host "url:    $($d.ssl_url)"
