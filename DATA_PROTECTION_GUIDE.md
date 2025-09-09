# 🔒 Data Protection & Persistence Guide

## Overview
This RiskVisio application implements **enterprise-grade data protection** to ensure **zero data loss** in Azure App Service.

## Data Storage Architecture

### 1. **Persistent Database Location**
- **Local Development**: `./data.db` (in project directory)
- **Azure Production**: `/home/data/data.db` (persistent storage)

**Why /home/data?**
- Azure App Service `/home` directory persists across app restarts
- Survives deployments and scaling operations
- Not affected by file system resets

### 2. **Automatic Backup System**

#### Backup Schedule
- ✅ **Initial backup**: 5 seconds after server startup
- ✅ **Regular backups**: Every 6 hours automatically
- ✅ **Shutdown backup**: Before server stops
- ✅ **Manual backups**: Via API endpoint

#### Backup Storage
- **Location**: `/home/data/backups/` (Azure) or `./backups/` (local)
- **Retention**: Last 10 backups kept automatically
- **Format**: `data-backup-YYYY-MM-DDTHH-mm-ss.db`

### 3. **Data Protection Features**

#### Graceful Shutdown
```javascript
process.on('SIGTERM', () => {
  createDatabaseBackup();  // Final backup before shutdown
  db.close();
  process.exit(0);
});
```

#### Health Monitoring
- Database connection monitoring
- File integrity checks
- Automatic backup verification

## API Endpoints for Data Management

### Create Manual Backup
```http
POST /api/database/backup
```

### List All Backups
```http
GET /api/database/backups
```

### Database Health Check
```http
GET /api/database/health
```

## Azure App Service Configuration

### Environment Variables (Set in Azure Portal)
```bash
NODE_ENV=production
RISKVISIO_API_KEY=your-api-key
RISKVISIO_ADMIN_KEY=your-admin-key
```

### Persistent Storage Setup
Azure App Service automatically provides persistent storage at `/home/data` - no additional configuration needed.

## Disaster Recovery Plan

### 1. **Data Recovery from Backup**
If main database is corrupted:

1. **Stop the application**
2. **List available backups**: `GET /api/database/backups`
3. **Copy backup file** to main database location
4. **Restart application**

### 2. **Manual Database Export**
```bash
# In Azure App Service SSH/Console
cd /home/data
cp data.db backup-manual-$(date +%Y%m%d).db
```

### 3. **Database Migration**
To move to a new Azure App Service:

1. **Download backups** from `/home/data/backups/`
2. **Upload to new service** at `/home/data/`
3. **Deploy application code**
4. **Verify data integrity**

## Monitoring & Alerts

### Key Metrics to Monitor
- Database file size growth
- Backup creation success/failure
- Disk space in `/home/data`
- Database connection health

### Log Messages to Watch
- ✅ `Database backup created`
- ❌ `Backup failed`
- ✅ `Connected to SQLite database`
- ❌ `Database connection failed`

## Best Practices

### 1. **Regular Verification**
- Test backup/restore process monthly
- Verify data integrity after deployments
- Monitor backup file sizes

### 2. **External Backup Strategy**
Consider additional protection:
- Download backups to secure external storage
- Implement database replication
- Use Azure Database for critical production

### 3. **Data Validation**
```javascript
// Verify critical data exists
const criticalTables = ['users', 'occurrences', 'risks', 'compliance'];
// Implementation in health check endpoint
```

## Troubleshooting

### Database Not Found
```bash
# Check if data directory exists
ls -la /home/data/

# Check permissions
ls -la /home/data/data.db

# Verify environment
echo $NODE_ENV
```

### Backup Failures
- Check disk space: `df -h /home/data`
- Verify write permissions
- Check application logs

### Data Corruption
1. Stop application
2. Check available backups
3. Restore from most recent good backup
4. Restart application
5. Verify data integrity

## Security Considerations

- Database file has restricted access in Azure App Service
- Backups inherit same security model
- API endpoints require authentication
- No sensitive data in log files

---

**Remember**: Your data is the most valuable asset. This multi-layered protection ensures **zero data loss** under normal operations and quick recovery in emergency situations.
