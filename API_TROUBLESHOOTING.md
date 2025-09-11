# 🔧 API Authentication Issues - Troubleshooting Guide

## Common Issues and Solutions

### 1. **"Client ID and Client Secret required" Error**

**Symptoms:**
- API returns 401 with message "Client ID and Client Secret required"
- Occurs when making requests to `/api/*` endpoints

**Root Causes:**
- Your API has keys created and is in "dual credential mode"
- Missing required authentication headers
- Incorrect header names

**Solutions:**

#### Option A: Use Proper Headers
```bash
# Include both headers in every API request
curl -X GET "http://localhost:8080/api/occurrences" \
  -H "x-client-id: your_client_id" \
  -H "x-client-secret: your_client_secret"
```

#### Option B: Reset to Bootstrap Mode
```javascript
// Delete all API keys to return to bootstrap mode
DELETE FROM api_keys;
```

#### Option C: Use Legacy Mode
```bash
# Set environment variable
set RISKVISIO_API_KEY=your-legacy-key
# Then use:
curl -X GET "http://localhost:8080/api/occurrences" \
  -H "x-api-key: your-legacy-key"
```

### 2. **"Invalid API key" or "Invalid client secret" Error**

**Symptoms:**
- 401 error with these specific messages
- Headers are provided but authentication fails

**Root Causes:**
- Wrong client ID (not found in database)
- Wrong client secret (doesn't match hash)
- API key is disabled or revoked

**Solutions:**

#### Check Your API Keys:
```bash
# List all API keys
curl -X GET "http://localhost:8080/api/api-keys"
```

#### Create New API Key:
```bash
curl -X POST "http://localhost:8080/api/api-keys" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Test Key", "accessType": "full"}'
```

### 3. **"Insufficient privileges" Error**

**Symptoms:**
- 403 error when making POST requests
- GET requests work fine

**Root Cause:**
- Your API key has `accessType: "limited"`
- Write operations require `accessType: "full"`

**Solution:**
```bash
# Create a new key with full access
curl -X POST "http://localhost:8080/api/api-keys" \
  -H "Content-Type: application/json" \
  -d '{"name": "Full Access Key", "accessType": "full"}'
```

### 4. **"Admin key required" Error**

**Symptoms:**
- Error when creating/revoking API keys
- Other endpoints work fine

**Root Cause:**
- `RISKVISIO_ADMIN_KEY` environment variable is set
- Missing `x-admin-key` header

**Solution:**
```bash
# Include admin key for key management
curl -X POST "http://localhost:8080/api/api-keys" \
  -H "x-admin-key: your-admin-key-value" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Key", "accessType": "full"}'
```

### 5. **Database/Connection Issues**

**Symptoms:**
- "Database error" messages
- Server crashes or timeouts

**Solutions:**

#### Check Database File:
```bash
# Verify database exists and is readable
ls -la data.db
```

#### Check Server Logs:
Look for these messages in console:
```
✅ Connected to SQLite database at: /path/to/data.db
✅ Database backup created: /path/to/backup.db
```

#### Reset Database:
```bash
# Backup current database
cp data.db data.db.backup

# Delete and restart server to recreate
rm data.db
node server.js
```

## Authentication Modes Explained

### Mode 1: Bootstrap (No Keys)
- **When:** No API keys exist in database
- **Access:** Open access to all endpoints
- **Use Case:** Initial setup, creating first API key

### Mode 2: Legacy Single Key
- **When:** `RISKVISIO_API_KEY` environment variable is set
- **Headers:** `x-api-key: value`
- **Use Case:** Simple deployment, backward compatibility

### Mode 3: Dual Credential (Production)
- **When:** API keys exist in database
- **Headers:** `x-client-id` + `x-client-secret`
- **Security:** Secrets are SHA-256 hashed
- **Use Case:** Production deployment, multiple integrations

## Testing Your API

### 1. Start the server:
```bash
node server.js
```

### 2. Test health endpoint:
```bash
curl http://localhost:8080/health
```

### 3. Check current authentication mode:
```bash
# If this returns data without auth, you're in bootstrap mode
curl http://localhost:8080/api/api-keys
```

### 4. Create your first API key:
```bash
curl -X POST "http://localhost:8080/api/api-keys" \
  -H "Content-Type: application/json" \
  -d '{"name": "My First Key", "accessType": "full", "createdBy": "admin"}'
```

### 5. Test with the new credentials:
```bash
# Use the clientId and clientSecret from step 4
curl -X GET "http://localhost:8080/api/occurrences" \
  -H "x-client-id: key_xxxxxxxxxxxx" \
  -H "x-client-secret: secret_xxxxxxxxxxxxxxxx"
```

## Power BI Integration

For Power BI, configure your Web data source with:

### Headers:
```
x-client-id: your_client_id
x-client-secret: your_client_secret
```

### URL Examples:
```
http://your-server.com/api/occurrences
http://your-server.com/api/incidents
http://your-server.com/api/risks
```

## Environment Variables

```bash
# Optional: Legacy API key mode
RISKVISIO_API_KEY=your-legacy-key

# Optional: Admin key for key management
RISKVISIO_ADMIN_KEY=your-admin-key

# Optional: Production database path
DB_PATH=/path/to/production/data.db
```

## Quick Fixes

### Reset Everything:
```bash
# Stop server
# Delete database
rm data.db
# Restart server
node server.js
# Create new API key
curl -X POST "http://localhost:8080/api/api-keys" \
  -H "Content-Type: application/json" \
  -d '{"name": "Fresh Start", "accessType": "full"}'
```

### Emergency Access:
```bash
# Set legacy mode temporarily
set RISKVISIO_API_KEY=emergency-access
node server.js
# Now use x-api-key header instead
```

## Need More Help?

1. Check server console for detailed error messages
2. Look at the `backups/` folder for recent database snapshots
3. Use the test script: `node test-api.js`
4. Check the `auth-middleware-fix.js` file for the corrected implementation

---
**Last Updated:** September 11, 2025
