param(
  [string]$ResourceGroup,
  [string]$StorageAccount,
  [string]$Location = "westeurope"
)

$ErrorActionPreference = "Stop"

if (-not $ResourceGroup -or -not $StorageAccount) {
  Write-Host "Usage: ./scripts/deploy-azure-storage.ps1 -ResourceGroup <rg> -StorageAccount <name> [-Location <region>]" -ForegroundColor Yellow
  exit 1
}

# Ensure az is available
az --version > $null 2>&1

# Build
Write-Host "Building production bundle..." -ForegroundColor Cyan
npm run build

# Create RG if needed
$rgExists = $(az group exists -n $ResourceGroup)
if ($rgExists -eq "false") {
  Write-Host "Creating resource group $ResourceGroup in $Location" -ForegroundColor Cyan
  az group create -n $ResourceGroup -l $Location | Out-Null
}

# Create storage if needed
$exists = $(az storage account check-name -n $StorageAccount --query 'nameAvailable' -o tsv)
if ($exists -eq "true") {
  Write-Host "Creating storage account $StorageAccount" -ForegroundColor Cyan
  az storage account create -n $StorageAccount -g $ResourceGroup -l $Location --sku Standard_LRS --kind StorageV2 | Out-Null
}

# Enable static website
Write-Host "Enabling static website..." -ForegroundColor Cyan
az storage blob service-properties update --account-name $StorageAccount --static-website --404-document index.html --index-document index.html | Out-Null

# Upload dist
Write-Host "Uploading dist to $web..." -ForegroundColor Cyan
az storage blob upload-batch --account-name $StorageAccount --destination '$web' --source dist --no-progress | Out-Null

# Show endpoint
$endpoint = az storage account show -n $StorageAccount -g $ResourceGroup --query "primaryEndpoints.web" -o tsv
Write-Host "Deployed to: $endpoint" -ForegroundColor Green
