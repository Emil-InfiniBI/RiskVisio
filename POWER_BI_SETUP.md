# 📊 Power BI Integration Guide

## ✅ Prerequisites
- Your API server is running on `http://localhost:3001` (✓ Confirmed working!)
- Power BI Desktop installed
- API key created in your admin panel

## 🔧 Step 1: Create API Key in Your Admin Panel

1. **Run your main app:**
   ```bash
   npm run dev
   ```

2. **Go to Admin → API Keys tab**

3. **Click "Create API Key"**
   - Name: `Power BI Integration`
   - Access Type: `Limited access` (for read-only reporting)

4. **Save the credentials** (shown only once):
   - Client ID: `key_xxxxxxxxx`
   - Client Secret: `secret_xxxxxxxxxxxxxxxxx`

## 🔌 Step 2: Connect Power BI to Your API

### Method 1: Web Connector (Recommended)

1. **Open Power BI Desktop**

2. **Get Data → Web**
   - URL: `http://localhost:3001/api/incidents`
   - Click "Advanced"

3. **Add HTTP request headers:**
   ```
   x-client-id: key_xxxxxxxxx
   x-client-secret: secret_xxxxxxxxxxxxxxxxx
   ```

4. **Authentication:**
   - Choose "Anonymous" (since we're using custom headers)

5. **Power BI will load the data:**
   ```json
   {
     "data": [incidents array],
     "count": 2,
     "timestamp": "2025-09-08T14:02:55.377Z"
   }
   ```

6. **Expand the "data" column** to see individual incidents

### Method 2: PowerShell/curl test first

Test the connection in PowerShell:
```powershell
$headers = @{
    'x-client-id' = 'key_your-client-id'
    'x-client-secret' = 'secret_your-client-secret'
}
Invoke-RestMethod -Uri 'http://localhost:3001/api/incidents' -Headers $headers
```

## 📈 Step 3: Import Different Data Types

### Available Endpoints:
- **Incidents:** `http://localhost:3001/api/incidents`
- **Risks:** `http://localhost:3001/api/risks`
- **Compliance:** `http://localhost:3001/api/compliance`
- **Factories:** `http://localhost:3001/api/factories`

### For each endpoint:
1. Get Data → Web
2. Use the same headers (x-client-id, x-client-secret)
3. Expand the "data" column
4. Load into Power BI

## 🎯 Step 4: Create Relationships

In Power BI Model view:
1. **Connect tables by factory code:**
   - Incidents[factory] ↔ Factories[code]
   - Risks[factory] ↔ Factories[code]
   - Compliance[factory] ↔ Factories[code]

## 📊 Step 5: Build Your Dashboard

### Sample Visualizations:

1. **KPI Cards:**
   - Total Incidents: `COUNT(Incidents[id])`
   - High-Risk Items: `COUNTROWS(FILTER(Risks, Risks[riskScore] > 10))`
   - Compliance Rate: `DIVIDE(COUNTROWS(FILTER(Compliance, Compliance[status] = "compliant")), COUNTROWS(Compliance))`

2. **Charts:**
   - **Line Chart:** Incidents over time (x: reportedDate, y: COUNT)
   - **Bar Chart:** Incidents by factory
   - **Heat Map:** Risk matrix (probability vs impact)
   - **Pie Chart:** Incident types distribution

3. **Tables:**
   - Recent incidents
   - Top risks by score
   - Non-compliant items

## 🔄 Step 6: Set Up Data Refresh

### For Live Data:
1. **Publish to Power BI Service**
2. **Configure scheduled refresh**
3. **Set refresh frequency** (hourly, daily, etc.)

### For Production:
- Deploy your API to Azure App Service
- Update Power BI connections to production URL
- Use Azure AD authentication for enhanced security

## 🛠️ Troubleshooting

### Common Issues:

1. **Connection Failed:**
   - Check if API server is running: `curl http://localhost:3001/health`
   - Verify API keys in admin panel

2. **Authentication Error:**
   - Double-check client ID and secret
   - Ensure headers are spelled correctly: `x-client-id`, `x-client-secret`

3. **Data Not Loading:**
   - Test endpoint in browser or PowerShell first
   - Check API server logs for errors

### Test Commands:
```powershell
# Test API health
curl http://localhost:3001/health

# Test with authentication
$headers = @{'x-client-id' = 'your-key'; 'x-client-secret' = 'your-secret'}
Invoke-RestMethod -Uri 'http://localhost:3001/api/incidents' -Headers $headers
```

## 🚀 Next Steps

1. **Add more data sources** to your API
2. **Create calculated columns** in Power BI
3. **Set up automated reports** and email subscriptions
4. **Deploy to production** for company-wide access

## 📞 Support

If you need help:
1. Check the API documentation: `http://localhost:3001/api`
2. Review server logs for errors
3. Test API endpoints manually before connecting Power BI
