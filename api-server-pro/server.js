const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'risk_management.db');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

// Database connection
let db;

function connectDB() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        resolve(db);
      }
    });
  });
}

// Initialize database tables
function initDatabase() {
  return new Promise((resolve, reject) => {
    const createTables = `
      -- API Keys table
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        client_id TEXT UNIQUE NOT NULL,
        client_secret_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        enabled BOOLEAN DEFAULT 1,
        access_type TEXT DEFAULT 'limited',
        created_date TEXT NOT NULL,
        created_by TEXT NOT NULL,
        last_used TEXT,
        revoked_date TEXT,
        revoked_by TEXT
      );

      -- Occurrences table
      CREATE TABLE IF NOT EXISTS occurrences (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        type TEXT,
        priority TEXT,
        status TEXT,
        factory TEXT,
        location TEXT,
        reported_by TEXT,
        reported_date TEXT,
        created_at TEXT,
        updated_at TEXT,
        data JSON
      );

      -- Incidents table
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT,
        severity TEXT,
        status TEXT,
        factory TEXT,
        location TEXT,
        reported_by TEXT,
        reported_date TEXT,
        assigned_to TEXT,
        root_cause TEXT,
        actions JSON,
        evidence JSON,
        tags JSON,
        created_at TEXT,
        updated_at TEXT
      );

      -- Risks table
      CREATE TABLE IF NOT EXISTS risks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        probability INTEGER,
        impact INTEGER,
        risk_score INTEGER,
        status TEXT,
        owner TEXT,
        factory TEXT,
        identified_date TEXT,
        review_date TEXT,
        mitigation_strategy TEXT,
        current_controls JSON,
        target_risk_score INTEGER,
        created_at TEXT,
        updated_at TEXT
      );

      -- Compliance table
      CREATE TABLE IF NOT EXISTS compliance (
        id TEXT PRIMARY KEY,
        requirement TEXT NOT NULL,
        regulation TEXT,
        description TEXT,
        status TEXT,
        priority TEXT,
        owner TEXT,
        factory TEXT,
        due_date TEXT,
        last_assessed TEXT,
        evidence JSON,
        created_at TEXT,
        updated_at TEXT
      );

      -- Data sync log
      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT,
        operation TEXT,
        record_id TEXT,
        timestamp TEXT,
        client_id TEXT
      );
    `;

    db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
        reject(err);
      } else {
        console.log('Database tables initialized');
        resolve();
      }
    });
  });
}

// API Key validation middleware
const validateApiKey = async (req, res, next) => {
  const clientId = req.headers['x-client-id'];
  const clientSecret = req.headers['x-client-secret'];
  
  if (!clientId || !clientSecret) {
    return res.status(401).json({ 
      error: 'Missing API credentials',
      message: 'Please provide x-client-id and x-client-secret headers'
    });
  }
  
  // Query database for API key
  db.get(
    'SELECT * FROM api_keys WHERE client_id = ? AND enabled = 1',
    [clientId],
    async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(401).json({ 
          error: 'Invalid API key',
          message: 'Client ID not found or disabled'
        });
      }
      
      // Verify client secret
      const isValidSecret = await bcrypt.compare(clientSecret, row.client_secret_hash);
      if (!isValidSecret) {
        return res.status(401).json({ 
          error: 'Invalid API credentials',
          message: 'Invalid client secret'
        });
      }
      
      // Update last used timestamp
      db.run(
        'UPDATE api_keys SET last_used = ? WHERE client_id = ?',
        [new Date().toISOString(), clientId]
      );
      
      // Add API key info to request
      req.apiKey = row;
      next();
    }
  );
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: db ? 'connected' : 'disconnected'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Risk Management API - Production',
    version: '1.0.0',
    description: 'Production API for integrating risk management data with Power BI and other systems',
    endpoints: {
      'GET /api/occurrences': 'Get all occurrences',
      'POST /api/occurrences': 'Create new occurrence',
      'PUT /api/occurrences/:id': 'Update occurrence',
      'DELETE /api/occurrences/:id': 'Delete occurrence',
      'GET /api/incidents': 'Get all incidents',
      'POST /api/incidents': 'Create new incident',
      'GET /api/risks': 'Get all risks',
      'POST /api/risks': 'Create new risk',
      'GET /api/compliance': 'Get compliance items',
      'POST /api/compliance': 'Create compliance item',
      'GET /api/factories': 'Get factory information',
      'POST /api/sync': 'Sync data from frontend app'
    },
    authentication: {
      method: 'API Key',
      headers: {
        'x-client-id': 'Your client ID',
        'x-client-secret': 'Your client secret'
      }
    },
    database: 'SQLite with automatic migrations'
  });
});

// Protected endpoints
app.use('/api', validateApiKey);

// Sync endpoint - allows frontend to push data to API
app.post('/api/sync', (req, res) => {
  const { table, data, operation = 'upsert' } = req.body;
  
  if (!table || !data) {
    return res.status(400).json({ error: 'Missing table or data' });
  }
  
  const allowedTables = ['occurrences', 'incidents', 'risks', 'compliance'];
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }
  
  // Handle bulk sync
  const records = Array.isArray(data) ? data : [data];
  let processed = 0;
  let errors = [];
  
  records.forEach((record, index) => {
    const columns = Object.keys(record).join(', ');
    const placeholders = Object.keys(record).map(() => '?').join(', ');
    const values = Object.values(record);
    
    const sql = `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`;
    
    db.run(sql, values, function(err) {
      if (err) {
        errors.push({ index, error: err.message });
      } else {
        processed++;
        
        // Log the sync operation
        db.run(
          'INSERT INTO sync_log (table_name, operation, record_id, timestamp, client_id) VALUES (?, ?, ?, ?, ?)',
          [table, operation, record.id, new Date().toISOString(), req.apiKey.client_id]
        );
      }
      
      // Send response when all records are processed
      if (index === records.length - 1) {
        res.json({
          message: 'Sync completed',
          processed,
          total: records.length,
          errors: errors.length > 0 ? errors : undefined,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
});

// Get occurrences
app.get('/api/occurrences', (req, res) => {
  const { factory, status, type, limit = 1000 } = req.query;
  
  let sql = 'SELECT * FROM occurrences WHERE 1=1';
  let params = [];
  
  if (factory) {
    sql += ' AND factory = ?';
    params.push(factory);
  }
  
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  });
});

// Create occurrence
app.post('/api/occurrences', (req, res) => {
  const occurrence = req.body;
  
  if (!occurrence.id || !occurrence.title) {
    return res.status(400).json({ error: 'Missing required fields: id, title' });
  }
  
  const columns = Object.keys(occurrence).join(', ');
  const placeholders = Object.keys(occurrence).map(() => '?').join(', ');
  const values = Object.values(occurrence);
  
  db.run(
    `INSERT INTO occurrences (${columns}) VALUES (${placeholders})`,
    values,
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create occurrence' });
      }
      
      res.status(201).json({ 
        message: 'Occurrence created', 
        id: occurrence.id,
        timestamp: new Date().toISOString()
      });
    }
  );
});

// Similar endpoints for incidents, risks, compliance...
app.get('/api/incidents', (req, res) => {
  const { factory, status, type, limit = 1000 } = req.query;
  
  let sql = 'SELECT * FROM incidents WHERE 1=1';
  let params = [];
  
  if (factory) {
    sql += ' AND factory = ?';
    params.push(factory);
  }
  
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  });
});

// Get factories
app.get('/api/factories', (req, res) => {
  const factories = [
    { code: 'BTL', name: 'Berlin Tech Lab', location: 'Berlin, Germany' },
    { code: 'BTO', name: 'Berlin Tech Operations', location: 'Berlin, Germany' },
    { code: 'BTI', name: 'Berlin Tech Innovation', location: 'Berlin, Germany' },
    { code: 'BTX', name: 'Berlin Tech Expansion', location: 'Berlin, Germany' },
    { code: 'BTT', name: 'Berlin Tech Testing', location: 'Berlin, Germany' },
    { code: 'BTG', name: 'Berlin Tech Global', location: 'Berlin, Germany' }
  ];
  
  res.json({
    data: factories,
    count: factories.length,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Initialize and start server
async function startServer() {
  try {
    await connectDB();
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`Risk Management API Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log(`Database: ${DB_PATH}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
