import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { randomBytes, createHash } from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Environment fallback single API key (legacy) & optional admin key for key management endpoints
const SINGLE_API_KEY = process.env.RISKVISIO_API_KEY;
const ADMIN_KEY = process.env.RISKVISIO_ADMIN_KEY; // if set, required for create/revoke operations

// Initialize SQLite database with persistent storage
// Use Azure App Service persistent storage: /home/site/wwwroot for persistence across deployments
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/home/data/data.db'  // Azure persistent storage directory
  : path.join(__dirname, 'data.db');  // Local development

// Ensure data directory exists in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const dataDir = '/home/data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✓ Created persistent data directory:', dataDir);
  }
}

console.log('📁 Database location:', dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Initialize database tables on startup
db.serialize(() => {
  // Occurrences table
  db.run(`CREATE TABLE IF NOT EXISTS occurrences (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    type TEXT,
    priority TEXT,
    status TEXT,
    factory TEXT,
    location TEXT,
    reportedBy TEXT,
    reportedDate TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    data TEXT
  )`);

  // Incidents table
  db.run(`CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    type TEXT,
    severity TEXT,
    status TEXT,
    factory TEXT,
    location TEXT,
    reportedBy TEXT,
    reportedDate TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    data TEXT
  )`);

  // Risks table
  db.run(`CREATE TABLE IF NOT EXISTS risks (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    likelihood TEXT,
    impact TEXT,
    riskLevel TEXT,
    status TEXT,
    factory TEXT,
    category TEXT,
    assignedTo TEXT,
    dueDate TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    data TEXT
  )`);

  // Compliance table
  db.run(`CREATE TABLE IF NOT EXISTS compliance (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    regulation TEXT,
    status TEXT,
    factory TEXT,
    dueDate TEXT,
    completedDate TEXT,
    assignedTo TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    data TEXT
  )`);

  // Investigations table
  db.run(`CREATE TABLE IF NOT EXISTS investigations (
    id TEXT PRIMARY KEY,
    incidentId TEXT,
    title TEXT,
    description TEXT,
    status TEXT,
    investigator TEXT,
    findings TEXT,
    recommendations TEXT,
    startDate TEXT,
    completedDate TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    data TEXT
  )`);

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    fullName TEXT,
    email TEXT,
    factories TEXT,
    isActive INTEGER,
    createdDate TEXT,
    lastLogin TEXT
  )`);

  // API Keys table (hashed secret stored)
  db.run(`CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    clientId TEXT UNIQUE,
    secretHash TEXT,
    name TEXT,
    enabled INTEGER,
    accessType TEXT,
    createdDate TEXT,
    createdBy TEXT,
    lastUsed TEXT,
    revokedDate TEXT,
    revokedBy TEXT
  )`);

  // Insert default users if none exist
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (!err && row.count === 0) {
      const defaultUsers = [
        {
          id: 'user_admin',
          username: 'admin',
          password: 'admin',
          role: 'admin',
          fullName: 'System Administrator',
          email: 'admin@riskvisio.com',
          factories: JSON.stringify(['BTL', 'BTG', 'BTT']),
          isActive: 1,
          createdDate: new Date().toISOString().split('T')[0]
        },
        {
          id: 'user_manager_btl',
          username: 'manager_btl',
          password: 'demo123',
          role: 'user',
          fullName: 'BTL Manager',
          email: 'manager.btl@riskvisio.com',
          factories: JSON.stringify(['BTL']),
          isActive: 1,
          createdDate: new Date().toISOString().split('T')[0]
        },
        {
          id: 'user_btg',
          username: 'user_btg',
          password: 'demo123',
          role: 'user',
          fullName: 'BTG User',
          email: 'user.btg@riskvisio.com',
          factories: JSON.stringify(['BTG']),
          isActive: 1,
          createdDate: new Date().toISOString().split('T')[0]
        }
      ];

      defaultUsers.forEach(user => {
        db.run(`INSERT INTO users (id, username, password, role, fullName, email, factories, isActive, createdDate, lastLogin)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.id, user.username, user.password, user.role, user.fullName, user.email, user.factories, user.isActive, user.createdDate, null],
          (err) => {
            if (err) {
              console.error('Error creating default user:', user.username, err);
            } else {
              console.log('✓ Created default user:', user.username);
            }
          }
        );
      });
    }
  });
});

// 🔒 DATA PROTECTION SYSTEM
// Automatic backup functionality to prevent data loss
function createDatabaseBackup() {
  try {
    if (!fs.existsSync(dbPath)) return false;
    
    const backupDir = process.env.NODE_ENV === 'production' 
      ? '/home/data/backups' 
      : path.join(__dirname, 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `data-backup-${timestamp}.db`);
    
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ Database backup created:', backupPath);
    
    // Keep only last 10 backups to manage disk space
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('data-backup-') && file.endsWith('.db'))
      .sort()
      .reverse();
    
    if (backups.length > 10) {
      backups.slice(10).forEach(backup => {
        const oldBackup = path.join(backupDir, backup);
        fs.unlinkSync(oldBackup);
        console.log('🗑️ Removed old backup:', backup);
      });
    }
    
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    return false;
  }
}

// Create initial backup on startup
setTimeout(() => {
  createDatabaseBackup();
}, 5000);

// Schedule automatic backups every 6 hours
setInterval(() => {
  createDatabaseBackup();
}, 6 * 60 * 60 * 1000);

// Graceful shutdown with final backup
process.on('SIGTERM', () => {
  console.log('🔄 Graceful shutdown initiated...');
  createDatabaseBackup();
  db.close((err) => {
    if (err) console.error('❌ Database close error:', err.message);
    else console.log('✅ Database connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Graceful shutdown initiated...');
  createDatabaseBackup();
  db.close((err) => {
    if (err) console.error('❌ Database close error:', err.message);
    else console.log('✅ Database connection closed.');
    process.exit(0);
  });
});

// Database health monitoring
function checkDatabaseHealth() {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1 as test', (err, row) => {
      if (err) reject(err);
      else resolve(row?.test === 1);
    });
  });
}

// Helper utilities for API keys
function generateRandomString(bytes = 16) {
  return randomBytes(bytes).toString('base64url');
}

function hashSecret(secret) {
  return createHash('sha256').update(secret).digest('hex');
}

// Dynamic API key auth middleware.
// Modes:
// 1. SINGLE_API_KEY env set -> legacy single-key mode (client provides x-api-key header matching env var).
// 2. Persistent keys mode -> once at least one enabled key exists in api_keys table, all requests (except bootstrap) must
//    include BOTH a client id and client secret. The pair functions like username/password:
//      Headers required: x-client-id, x-client-secret
//      (Legacy compatibility: x-api-key still accepted for client id; query params client_id/client_secret also accepted.)
// 3. Bootstrap (no keys yet) -> open access to allow first key creation.
// Access control:
//   - Write operations (POST) excluding key management endpoints require a key with accessType === 'full'.
//   - Key management modifications (create/revoke) require ADMIN_KEY if set.
// Notes:
//   - Client secrets are hashed (sha256) in the database. We hash the provided secret and compare.
//   - If a request supplies a client id but no secret once keys exist, we reject with 401 to enforce the new model.
app.use('/api', (req, res, next) => {
  // Skip protection for key management endpoints writes if admin key configured & supplied
  const isKeyManagement = req.path.startsWith('/api/api-keys');
  if (SINGLE_API_KEY) {
    if (!isKeyManagement) {
      const provided = req.header('x-api-key') || req.query.api_key;
      if (provided !== SINGLE_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: invalid API key' });
      }
    }
    return next();
  }

  db.get('SELECT COUNT(*) as cnt FROM api_keys WHERE enabled = 1 AND revokedDate IS NULL', (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const haveKeys = row?.cnt > 0;
    if (!haveKeys) return next(); // bootstrap open access until first key created

    // For key management modifications require admin key if configured
    if (isKeyManagement && ['POST', 'DELETE'].includes(req.method) && ADMIN_KEY) {
      const adminHeader = req.header('x-admin-key');
      if (adminHeader !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Admin key required' });
      }
    }

    const clientId = req.header('x-client-id') || req.header('x-api-key') || req.query.client_id || req.query.api_key;
    const clientSecret = req.header('x-client-secret') || req.query.client_secret;

    if (!clientId || !clientSecret) {
      return res.status(401).json({ error: 'Client ID and Client Secret required' });
    }

    db.get('SELECT * FROM api_keys WHERE clientId = ? AND enabled = 1 AND revokedDate IS NULL', [clientId], (err2, keyRow) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      if (!keyRow) return res.status(401).json({ error: 'Invalid API key' });

      // Verify secret
      const providedHash = hashSecret(clientSecret);
      if (providedHash !== keyRow.secretHash) {
        return res.status(401).json({ error: 'Invalid client secret' });
      }

      // Enforce access level for write operations (except key management endpoints)
      if (req.method === 'POST' && !isKeyManagement && keyRow.accessType !== 'full') {
        return res.status(403).json({ error: 'Insufficient privileges (write requires full access key)' });
      }

      // Update lastUsed asynchronously
  db.run('UPDATE api_keys SET lastUsed = ? WHERE id = ?', [new Date().toISOString(), keyRow.id], () => {});
      next();
    });
  });
});

// Basic health check for Azure App Service
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'RiskVisio Demo', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/occurrences', (req, res) => {
  const { factory } = req.query;
  let query = 'SELECT * FROM occurrences ORDER BY createdAt DESC';
  let params = [];
  
  if (factory && factory !== 'ALL') {
    query = 'SELECT * FROM occurrences WHERE factory = ? ORDER BY createdAt DESC';
    params = [factory];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const occurrences = rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : {}
    }));
    
    res.json(occurrences);
  });
});

app.post('/api/occurrences', (req, res) => {
  const occurrence = req.body;
  const id = occurrence.id || Date.now().toString();
  const now = new Date().toISOString();
  
  db.run(
    `INSERT OR REPLACE INTO occurrences 
     (id, title, description, type, priority, status, factory, location, reportedBy, reportedDate, createdAt, updatedAt, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, occurrence.title, occurrence.description, occurrence.type, occurrence.priority, 
     occurrence.status, occurrence.factory, occurrence.location, occurrence.reportedBy, 
     occurrence.reportedDate, occurrence.createdAt || now, now, JSON.stringify(occurrence.data || {})],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, ...occurrence, createdAt: occurrence.createdAt || now, updatedAt: now });
    }
  );
});

// Similar endpoints for incidents, risks, compliance, investigations
app.get('/api/incidents', (req, res) => {
  const { factory } = req.query;
  let query = 'SELECT * FROM incidents ORDER BY createdAt DESC';
  let params = [];
  
  if (factory && factory !== 'ALL') {
    query = 'SELECT * FROM incidents WHERE factory = ? ORDER BY createdAt DESC';
    params = [factory];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const incidents = rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : {}
    }));
    
    res.json(incidents);
  });
});

app.get('/api/risks', (req, res) => {
  const { factory } = req.query;
  let query = 'SELECT * FROM risks ORDER BY createdAt DESC';
  let params = [];
  
  if (factory && factory !== 'ALL') {
    query = 'SELECT * FROM risks WHERE factory = ? ORDER BY createdAt DESC';
    params = [factory];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const risks = rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : {}
    }));
    
    res.json(risks);
  });
});

app.get('/api/compliance', (req, res) => {
  const { factory } = req.query;
  let query = 'SELECT * FROM compliance ORDER BY createdAt DESC';
  let params = [];
  
  if (factory && factory !== 'ALL') {
    query = 'SELECT * FROM compliance WHERE factory = ? ORDER BY createdAt DESC';
    params = [factory];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const compliance = rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : {}
    }));
    
    res.json(compliance);
  });
});

app.post('/api/compliance', (req, res) => {
  const compliance = req.body;
  const id = compliance.id || Date.now().toString();
  const now = new Date().toISOString();
  
  db.run(
    `INSERT OR REPLACE INTO compliance 
     (id, title, description, regulation, status, factory, dueDate, completedDate, assignedTo, createdAt, updatedAt, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, compliance.title, compliance.description, compliance.regulation, compliance.status, 
     compliance.factory, compliance.dueDate, compliance.completedDate, compliance.assignedTo, 
     compliance.createdAt || now, now, JSON.stringify(compliance.data || {})],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, ...compliance, createdAt: compliance.createdAt || now, updatedAt: now });
    }
  );
});

app.get('/api/investigations', (req, res) => {
  const { factory } = req.query;
  let query = 'SELECT * FROM investigations ORDER BY createdAt DESC';
  let params = [];
  
  if (factory && factory !== 'ALL') {
    query = 'SELECT * FROM investigations WHERE factory = ? ORDER BY createdAt DESC';
    params = [factory];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const investigations = rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : {}
    }));
    
    res.json(investigations);
  });
});

// Users endpoints
app.get('/api/users', (_req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const users = rows.map(r => ({
      ...r,
      factories: r.factories ? JSON.parse(r.factories) : []
    }));
    res.json(users);
  });
});

app.post('/api/users', (req, res) => {
  const u = req.body;
  const id = u.id || Date.now().toString();
  const createdDate = u.createdDate || new Date().toISOString().split('T')[0];
  db.run(`INSERT OR REPLACE INTO users (id, username, password, role, fullName, email, factories, isActive, createdDate, lastLogin)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, u.username, u.password, u.role, u.fullName, u.email, JSON.stringify(u.factories || []), u.isActive ? 1 : 0, createdDate, u.lastLogin || null],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id, ...u, createdDate });
    });
});

app.delete('/api/users/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ deleted: this.changes });
  });
});

// API Key management endpoints
// List keys (never returns secret hash)
app.get('/api/api-keys', (_req, res) => {
  db.all('SELECT id, clientId, name, enabled, accessType, createdDate, createdBy, lastUsed, revokedDate, revokedBy FROM api_keys ORDER BY createdDate DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Create new key (returns clientSecret once)
app.post('/api/api-keys', (req, res) => {
  const { name, accessType = 'limited', createdBy = 'system' } = req.body || {};
  if (!name || !['limited', 'full'].includes(accessType)) {
    return res.status(400).json({ error: 'Invalid name or accessType' });
  }
  const id = Date.now().toString(36) + generateRandomString(6);
  const clientId = 'key_' + generateRandomString(12);
  const clientSecret = 'secret_' + generateRandomString(24);
  const secretHash = hashSecret(clientSecret);
  const createdDate = new Date().toISOString();
  db.run(`INSERT INTO api_keys (id, clientId, secretHash, name, enabled, accessType, createdDate, createdBy) VALUES (?,?,?,?,?,?,?,?)`,
    [id, clientId, secretHash, name, 1, accessType, createdDate, createdBy], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id, clientId, clientSecret, name, enabled: true, accessType, createdDate, createdBy });
    });
});

// Revoke key
app.post('/api/api-keys/:id/revoke', (req, res) => {
  const { id } = req.params;
  const revokedDate = new Date().toISOString();
  const revokedBy = req.body?.revokedBy || 'system';
  db.run('UPDATE api_keys SET enabled = 0, revokedDate = ?, revokedBy = ? WHERE id = ? AND revokedDate IS NULL', [revokedDate, revokedBy, id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Key not found or already revoked' });
    res.json({ revoked: true, id, revokedDate, revokedBy });
  });
});

// 🔄 DATA SYNC ENDPOINT - for frontend auto-sync functionality
app.post('/api/sync', (req, res) => {
  const { type, data } = req.body;
  
  // Validate input
  if (!type || !data) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      hint: 'Provide both type and data fields'
    });
  }

  const allowedTypes = ['occurrences', 'incidents', 'risks', 'compliance'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid data type',
      hint: `Allowed types: ${allowedTypes.join(', ')}`
    });
  }

  const records = Array.isArray(data) ? data : [data];
  if (records.length === 0) {
    return res.json({ 
      success: true, 
      message: 'No data to sync',
      processed: 0,
      timestamp: new Date().toISOString()
    });
  }

  let processed = 0;
  let errors = [];
  const total = records.length;

  // Process each record
  records.forEach((record, index) => {
    const id = record.id || Date.now().toString() + '_' + index;
    const now = new Date().toISOString();
    
    // Prepare data based on type
    let sql, params;
    
    if (type === 'occurrences') {
      sql = `INSERT OR REPLACE INTO occurrences 
             (id, title, description, type, priority, status, factory, location, reportedBy, reportedDate, createdAt, updatedAt, data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      params = [
        id, record.title, record.description, record.type, record.priority,
        record.status, record.factory, record.location, record.reportedBy,
        record.reportedDate, record.createdAt || now, now, JSON.stringify(record.data || {})
      ];
    } else if (type === 'incidents') {
      sql = `INSERT OR REPLACE INTO incidents 
             (id, title, description, type, severity, status, factory, location, reportedBy, reportedDate, createdAt, updatedAt, data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      params = [
        id, record.title, record.description, record.type, record.severity,
        record.status, record.factory, record.location, record.reportedBy,
        record.reportedDate, record.createdAt || now, now, JSON.stringify(record.data || {})
      ];
    } else if (type === 'risks') {
      sql = `INSERT OR REPLACE INTO risks 
             (id, title, description, likelihood, impact, riskLevel, status, factory, category, assignedTo, dueDate, createdAt, updatedAt, data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      params = [
        id, record.title, record.description, record.likelihood, record.impact,
        record.riskLevel, record.status, record.factory, record.category,
        record.assignedTo, record.dueDate, record.createdAt || now, now, JSON.stringify(record.data || {})
      ];
    } else if (type === 'compliance') {
      sql = `INSERT OR REPLACE INTO compliance 
             (id, title, description, status, factory, dueDate, assignedTo, createdAt, updatedAt, data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      params = [
        id, record.title, record.description, record.status, record.factory,
        record.dueDate, record.assignedTo, record.createdAt || now, now, JSON.stringify(record.data || {})
      ];
    }

    // Execute the insert
    db.run(sql, params, function(err) {
      if (err) {
        console.error(`Error syncing ${type} record ${id}:`, err);
        errors.push({ 
          index, 
          id, 
          error: err.message 
        });
      } else {
        processed++;
      }

      // Send response when all records are processed
      if (index === records.length - 1) {
        const success = errors.length === 0;
        const timestamp = new Date().toISOString();
        
        // Create backup after successful sync
        if (success && processed > 0) {
          try {
            createDatabaseBackup();
          } catch (backupErr) {
            console.warn('Backup creation failed after sync:', backupErr);
          }
        }

        res.json({
          success,
          message: success ? 'Data sync completed successfully' : 'Data sync completed with errors',
          type,
          processed,
          total,
          errors: errors.length > 0 ? errors : undefined,
          timestamp
        });
      }
    });
  });
});

// Database viewer endpoint - shows all tables and their data
app.get('/api/database', (req, res) => {
  const tables = ['occurrences', 'incidents', 'risks', 'compliance', 'investigations'];
  const result = {};
  let completed = 0;
  
  tables.forEach(tableName => {
    db.all(`SELECT * FROM ${tableName} ORDER BY createdAt DESC`, (err, rows) => {
      if (err) {
        result[tableName] = { error: err.message };
      } else {
        result[tableName] = {
          count: rows.length,
          data: rows.map(row => ({
            ...row,
            data: row.data ? JSON.parse(row.data) : {}
          }))
        };
      }
      
      completed++;
      if (completed === tables.length) {
        res.json({
          database: 'SQLite',
          location: '/home/site/wwwroot/data.db',
          tables: result,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
});

// Database schema endpoint - shows table structures
app.get('/api/database/schema', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const schema = {};
    let completed = 0;
    
    tables.forEach(table => {
      db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
        if (err) {
          schema[table.name] = { error: err.message };
        } else {
          schema[table.name] = columns;
        }
        
        completed++;
        if (completed === tables.length) {
          res.json({
            database: 'SQLite',
            tables: schema,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  });
});

// 🔒 BACKUP MANAGEMENT ENDPOINTS
// Manual backup creation
app.post('/api/database/backup', (req, res) => {
  try {
    const backupPath = createDatabaseBackup();
    if (backupPath) {
      res.json({ 
        success: true, 
        message: 'Backup created successfully',
        backupPath: backupPath,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ error: 'Backup creation failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Backup creation failed: ' + error.message });
  }
});

// List available backups
app.get('/api/database/backups', (req, res) => {
  try {
    const backupDir = process.env.NODE_ENV === 'production' 
      ? '/home/data/backups' 
      : path.join(__dirname, 'backups');
    
    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }
    
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('data-backup-') && file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          created: stats.birthtime,
          size: stats.size,
          path: filePath
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json({ 
      backups,
      currentDatabase: dbPath,
      backupDirectory: backupDir 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list backups: ' + error.message });
  }
});

// Database health check
app.get('/api/database/health', async (req, res) => {
  try {
    const isHealthy = await checkDatabaseHealth();
    const stats = fs.statSync(dbPath);
    
    res.json({
      healthy: isHealthy,
      database: {
        path: dbPath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      },
      backupStatus: {
        autoBackupEnabled: true,
        intervalHours: 6,
        lastBackupCheck: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      healthy: false, 
      error: error.message 
    });
  }
});

// Serve static assets from Vite build output
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RiskVisio demo running on port ${PORT}`);
});
