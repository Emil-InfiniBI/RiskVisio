$ErrorActionPreference = 'Stop'
$proj = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$root = Split-Path -Parent $proj
$backupDir = Join-Path $root 'backups'
if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$zipPath = Join-Path $backupDir ("erm-backup-" + $stamp + ".zip")
$exclude = @('node_modules','dist','.git','.turbo','.next','.svelte-kit')
$items = Get-ChildItem -LiteralPath $proj -Force | Where-Object { $exclude -notcontains $_.Name } | Select-Object -ExpandProperty FullName
Compress-Archive -Path $items -DestinationPath $zipPath -Force -CompressionLevel Optimal
Write-Output $zipPath
