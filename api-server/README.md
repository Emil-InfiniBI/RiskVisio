# Risk Management API Server

This is a Node.js/Express API server that provides endpoints for Power BI integration with your Risk Management system.

## Setup

1. Install dependencies:
```bash
cd api-server
npm install
```

2. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

3. The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
All API endpoints (except `/health` and `/api`) require API key authentication:

Headers required:
- `x-client-id`: Your client ID (generated in admin panel)
- `x-client-secret`: Your client secret (generated in admin panel)

### Available Endpoints

- `GET /health` - Health check (no auth required)
- `GET /api` - API documentation (no auth required)
- `GET /api/incidents` - Get all incidents
- `GET /api/risks` - Get all risks  
- `GET /api/compliance` - Get compliance items
- `GET /api/factories` - Get factory information

### Query Parameters

Most endpoints support filtering:
- `factory`: Filter by factory code (BTL, BTO, etc.)
- `status`: Filter by status
- `type`: Filter by type/category

Example: `GET /api/incidents?factory=BTL&status=investigating`

## Power BI Integration

1. In Power BI Desktop, go to "Get Data" > "Web"
2. Enter the API URL: `http://localhost:3001/api/incidents`
3. Choose "Advanced" and add headers:
   - `x-client-id`: [your-client-id]
   - `x-client-secret`: [your-client-secret]
4. Power BI will import the data for reporting

## Production Deployment

For production deployment:

1. Update the API key validation to use a real database
2. Add proper logging and monitoring
3. Use environment variables for sensitive data
4. Deploy to Azure App Service, AWS, or your preferred platform
5. Update the Power BI connection to use the production URL

## Example API Response

```json
{
  "data": [
    {
      "id": "2025-0001",
      "title": "Equipment Malfunction",
      "type": "operational",
      "severity": "medium",
      "status": "investigating",
      "factory": "BTL",
      "reportedDate": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "timestamp": "2025-01-15T12:00:00Z"
}
```
