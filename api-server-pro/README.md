# 🚀 Production Risk Management API

## Overview
This is a production-ready API server that your customers can deploy to connect their Risk Management app data to Power BI and other systems.

## Features
- ✅ **SQLite Database** - Persistent data storage
- ✅ **API Key Authentication** - Secure access control  
- ✅ **Data Sync Endpoint** - Frontend app can push data
- ✅ **Power BI Ready** - Optimized for BI integrations
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Error Handling** - Robust error management
- ✅ **Docker Support** - Easy deployment
- ✅ **Azure Compatible** - Ready for cloud deployment

## Quick Start

### 1. Install Dependencies
```bash
cd api-server-pro
npm install
```

### 2. Initialize Database
```bash
npm run setup
```
This creates the database and generates your first API key.

### 3. Start Server
```bash
npm start
# or for development
npm run dev
```

Server runs on `http://localhost:3001`

## 🔑 API Authentication

All endpoints require API key authentication:

```http
GET /api/occurrences
x-client-id: key_xxxxxxxxx
x-client-secret: secret_xxxxxxxxxxxxxxxxx
```

## 📊 Power BI Integration

### Connect Power BI:
1. **Get Data** → **Web**
2. **URL:** `http://localhost:3001/api/occurrences`
3. **Advanced** → Add headers:
   - `x-client-id`: [your-client-id]
   - `x-client-secret`: [your-client-secret]

### Available Endpoints:
- `/api/occurrences` - Occurrence reports
- `/api/incidents` - Incident data
- `/api/risks` - Risk assessments  
- `/api/compliance` - Compliance items
- `/api/factories` - Factory information

## 🔄 Data Synchronization

Your frontend app can sync data to the API:

```javascript
// Sync occurrences from localStorage to API
async function syncData() {
  const occurrences = JSON.parse(localStorage.getItem('occurrences') || '[]');
  
  const response = await fetch('http://localhost:3001/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': 'your-client-id',
      'x-client-secret': 'your-client-secret'
    },
    body: JSON.stringify({
      table: 'occurrences',
      data: occurrences,
      operation: 'upsert'
    })
  });
  
  const result = await response.json();
  console.log('Sync result:', result);
}
```

## 🌐 Customer Deployment Options

### Option 1: Local Deployment
- Customer runs on their own servers
- Complete data control
- No cloud dependencies

### Option 2: Azure App Service
```bash
# Deploy to Azure
az webapp create --resource-group myResourceGroup --plan myPlan --name myapp --runtime "node|18-lts"
az webapp deployment source config-zip --resource-group myResourceGroup --name myapp --src api-server-pro.zip
```

### Option 3: Docker Container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Configuration

### Environment Variables
```env
PORT=3001
DB_PATH=./data/risk_management.db
JWT_SECRET=your-secret-key-here
```

### Database Configuration
- **SQLite** for simplicity (included)
- **PostgreSQL** support (optional)
- **Azure SQL** support (cloud deployment)

## 📈 Monitoring & Analytics

### Built-in Metrics:
- API usage tracking
- Response times
- Error rates
- Data sync statistics

### Integration Ready:
- Azure Application Insights
- Power BI usage reports
- Custom logging

## 🔒 Security Features

- **API Key Authentication**
- **Rate Limiting** (100 requests/15min)
- **Helmet.js** security headers
- **CORS** protection
- **Input validation**
- **SQL injection protection**

## 📋 Customer Delivery Package

When selling to customers, provide:

1. **API Server** (this folder)
2. **Setup Instructions** (this README)
3. **Power BI Template** (.pbit file)
4. **Configuration Guide**
5. **Support Documentation**

## 🎯 Value Proposition for Customers

- **"Plug & Play" Power BI Integration**
- **No vendor lock-in** - customer owns their data
- **Scalable architecture** - grows with their business
- **Professional support** - you provide implementation help
- **Custom reporting** - unlimited Power BI flexibility

## 💰 Pricing Model Ideas

- **Basic:** Local deployment + standard support
- **Pro:** Azure deployment + advanced features
- **Enterprise:** Custom integrations + priority support

## 🚀 Next Steps

1. Test the API with your app data
2. Create Power BI templates for customers
3. Package for easy customer deployment
4. Develop customer onboarding process
