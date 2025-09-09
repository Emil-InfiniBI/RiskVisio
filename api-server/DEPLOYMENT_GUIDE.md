# 🚀 Production API Deployment Guide

## 📋 Overview

This guide helps your customers deploy the Risk Management API for Power BI integration. The API provides secure, scalable access to risk management data for reporting and analytics.

## 🏗️ Architecture

```
[Frontend App] ↔ [API Server] ↔ [SQLite Database] ↔ [Power BI]
```

- **Frontend App**: Your risk management web application
- **API Server**: Node.js/Express server with authentication
- **SQLite Database**: Lightweight, file-based database
- **Power BI**: Microsoft Power BI for reporting and analytics

## ⚡ Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Your risk management app running
- Power BI Desktop (for testing)

### 2. Deploy API Server

```bash
# 1. Extract API server files
cd risk-management-api/

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

### 3. Sync Data

1. Open your risk management app
2. Go to **Admin → API Sync**
3. Click **"Test API Connection"** (should show "API is healthy")
4. Click **"Sync Data to API"**

### 4. Connect Power BI

1. Open Power BI Desktop
2. **Get Data → Web**
3. URL: `http://localhost:3001/api/occurrences`
4. **Advanced → Add Headers:**
   - `x-client-id`: `key_admin`
   - `x-client-secret`: `secret_admin`
5. Your real data will now load!

## 🔧 Configuration

### Environment Variables

Create `.env` file in API server directory:

```env
PORT=3001
NODE_ENV=production
API_RATE_LIMIT=1000
```

### Database Configuration

- **Development**: SQLite (included)
- **Production**: SQLite or upgrade to PostgreSQL/MySQL

### Security Configuration

The API includes:
- API key authentication
- CORS protection
- Helmet security headers
- Rate limiting (configurable)

## 🌐 Production Deployment

### Option 1: Azure App Service

1. **Create Azure App Service**
2. **Deploy code via GitHub Actions or ZIP**
3. **Set environment variables**
4. **Update Power BI URLs to production**

### Option 2: Docker Container

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Option 3: On-Premises Server

1. **Install Node.js on Windows/Linux server**
2. **Copy API server files**
3. **Install as Windows Service or systemd service**
4. **Configure firewall for port 3001**

## 📊 API Endpoints

### Data Endpoints
- `GET /api/occurrences` - Main occurrence data
- `GET /api/incidents` - Incident reports
- `GET /api/risks` - Risk assessments
- `GET /api/compliance` - Compliance items
- `GET /api/factories` - Factory information

### Management Endpoints
- `GET /health` - Health check
- `GET /api` - API documentation
- `POST /api/sync` - Sync data from frontend

### Query Parameters
- `factory`: Filter by factory code
- `status`: Filter by status
- `type`: Filter by type/category
- `limit`: Limit results (default: 1000)

Example: `/api/occurrences?factory=BTL&status=investigating&limit=500`

## 🔐 Authentication

### API Key Format
- **Client ID**: `key_xxxxxxxxx`
- **Client Secret**: `secret_xxxxxxxxxxxxxxxxx`

### Creating API Keys
1. **In your app**: Admin → API Keys
2. **Generate new key** for each Power BI user/report
3. **Set access level**: Limited (read-only) or Full

### Power BI Authentication
```
Headers:
x-client-id: key_your_client_id
x-client-secret: secret_your_client_secret
```

## 📈 Power BI Integration

### Sample Power BI Queries

```powerquery
// Get all occurrences
let
    Source = Web.Contents("http://localhost:3001/api/occurrences", [
        Headers=[
            #"x-client-id"="key_admin",
            #"x-client-secret"="secret_admin"
        ]
    ]),
    JsonData = Json.Document(Source),
    DataTable = Table.FromList(JsonData[data], Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandedData = Table.ExpandRecordColumn(DataTable, "Column1", {"id", "title", "type", "status", "factory", "reportedDate"})
in
    ExpandedData
```

### Dashboard Examples

1. **KPI Cards**
   - Total Occurrences: `COUNT(occurrences[id])`
   - High Priority: `COUNTROWS(FILTER(occurrences, occurrences[priority] = "high"))`
   - Open Issues: `COUNTROWS(FILTER(occurrences, occurrences[status] <> "closed"))`

2. **Charts**
   - **Line Chart**: Occurrences by date
   - **Bar Chart**: Occurrences by factory
   - **Pie Chart**: Occurrence types distribution

3. **Tables**
   - Recent occurrences
   - Open high-priority items

## 🔄 Data Refresh

### Manual Refresh
1. **Update data in your app**
2. **Go to Admin → API Sync**
3. **Click "Sync Data to API"**
4. **Refresh Power BI report**

### Automatic Refresh
- **Power BI Service**: Set up scheduled refresh
- **Power BI Premium**: Real-time streaming
- **Custom**: Webhook-triggered sync

## 🛠️ Troubleshooting

### Common Issues

1. **API Not Starting**
   ```bash
   # Check if port is in use
   netstat -ano | findstr :3001
   
   # Kill existing process
   taskkill /PID <process_id> /F
   ```

2. **Power BI Connection Failed**
   - Verify API is running: `curl http://localhost:3001/health`
   - Check API keys are correct
   - Ensure headers are properly formatted

3. **No Data in Power BI**
   - Test sync in Admin panel
   - Check database file exists: `api-server/data.db`
   - Verify data in app: Admin → API Sync (data counts)

4. **Performance Issues**
   - Add query limits: `?limit=500`
   - Filter by factory: `?factory=BTL`
   - Index database for large datasets

### Logs and Monitoring

```bash
# View API logs
npm start 2>&1 | tee api.log

# Monitor database
sqlite3 data.db "SELECT COUNT(*) FROM occurrences;"
```

## 📞 Support

### For Customers
1. **Check API documentation**: `http://localhost:3001/api`
2. **Test health endpoint**: `http://localhost:3001/health`
3. **Review logs** for error messages
4. **Contact support** with specific error details

### For Development
1. **Database schema**: See `server.js` table definitions
2. **API specification**: OpenAPI/Swagger available
3. **Extension points**: Custom endpoints, authentication
4. **Scaling**: Database migration, load balancing

## 🎯 Next Steps

1. **Deploy to production environment**
2. **Set up monitoring and alerting**
3. **Create custom Power BI templates**
4. **Train users on Power BI integration**
5. **Plan for data retention and archival**

---

This API solution provides enterprise-grade data access for your risk management system, enabling powerful analytics and reporting capabilities through Power BI integration.
