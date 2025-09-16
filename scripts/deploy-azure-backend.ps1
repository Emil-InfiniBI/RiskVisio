# Deploy RiskVisio Backend to Azure App Service

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,
    
    [Parameter(Mandatory=$true)]
    [string]$AppName,
    
    [string]$Location = "westeurope"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying RiskVisio Backend to Azure App Service..." -ForegroundColor Green

# Check if logged in to Azure
try {
    az account show | Out-Null
} catch {
    Write-Host "❌ Please login to Azure first: az login" -ForegroundColor Red
    exit 1
}

# Create resource group if it doesn't exist
Write-Host "📦 Creating resource group: $ResourceGroup" -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location

# Create App Service Plan (Free tier)
Write-Host "⚡ Creating App Service Plan (Free tier)..." -ForegroundColor Cyan
az appservice plan create --name "${AppName}-plan" --resource-group $ResourceGroup --sku F1 --is-linux

# Create Web App with Node.js runtime
Write-Host "🌐 Creating Web App: $AppName" -ForegroundColor Cyan
az webapp create --resource-group $ResourceGroup --plan "${AppName}-plan" --name $AppName --runtime "NODE|18-lts"

# Configure environment variables for production
Write-Host "⚙️ Configuring environment variables..." -ForegroundColor Cyan
az webapp config appsettings set --resource-group $ResourceGroup --name $AppName --settings @(
    "NODE_ENV=production",
    "PORT=8080",
    "WEBSITES_PORT=8080"
)

# Deploy from local directory
Write-Host "📤 Deploying code..." -ForegroundColor Cyan

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path ".\*" -DestinationPath ".\deploy.zip" -Force

# Deploy the package
az webapp deployment source config-zip --resource-group $ResourceGroup --name $AppName --src ".\deploy.zip"

# Clean up
Remove-Item ".\deploy.zip" -Force

# Show the URL
$appUrl = "https://${AppName}.azurewebsites.net"
Write-Host "✅ Backend deployed successfully to FREE tier!" -ForegroundColor Green
Write-Host "🌐 Your API is now available at: $appUrl" -ForegroundColor Yellow
Write-Host "🔗 Health check: $appUrl/health" -ForegroundColor Yellow

Write-Host "`n⚠️  FREE TIER LIMITATIONS:" -ForegroundColor Yellow
Write-Host "• App sleeps after 20 minutes of inactivity" -ForegroundColor White
Write-Host "• First request after sleep takes 10-30 seconds to wake up" -ForegroundColor White
Write-Host "• 60 CPU minutes per day limit" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update your frontend to use: $appUrl instead of localhost:8080" -ForegroundColor White
Write-Host "2. Redeploy your frontend with the new API URL" -ForegroundColor White
Write-Host "3. Your app will now work 24/7 (with sleep/wake cycle)!" -ForegroundColor White
