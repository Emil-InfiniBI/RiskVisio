# 🔧 Azure Deployment Guide - Fix Offline Issue

## The Problem
Your app goes offline when your PC is off because:
- ✅ **Frontend**: Deployed to Azure Static Web App (always online)  
- ❌ **Backend**: Running on your PC at localhost:8080 (offline when PC is off)

## Solution: Deploy Backend to Azure

### Step 1: Install Azure CLI
```powershell
# Install Azure CLI
winget install Microsoft.AzureCLI
```

### Step 2: Login to Azure
```powershell
az login
```

### Step 3: Deploy Your Backend
```powershell
# Navigate to your project
cd C:\dev\enterprise-risk-mana-main

# Run the deployment script
.\scripts\deploy-azure-backend.ps1 -ResourceGroup "riskvisio-rg" -AppName "riskvisio-api"
```

### Step 4: Update Frontend Configuration
After backend deployment, you'll get a URL like: `https://riskvisio-api.azurewebsites.net`

Update your frontend to use this URL instead of localhost:8080

### Step 5: Redeploy Frontend
```powershell
# Redeploy frontend with new API URL
.\scripts\deploy-azure-storage.ps1 -ResourceGroup "riskvisio-rg" -StorageAccount "riskvisiostorage"
```

## Result
- ✅ **Frontend**: Azure Static Web App  
- ✅ **Backend**: Azure App Service
- ✅ **Database**: Azure persistent storage
- ✅ **24/7 Availability**: Works even when your PC is off!

## Cost Estimate
- Azure App Service B1: ~$15/month
- Azure Storage Account: ~$1/month
- **Total**: ~$16/month for full cloud hosting

## Alternative: Free Tier
- Use Azure App Service F1 (Free tier) for development
- Limitation: Sleeps after 20 minutes of inactivity
