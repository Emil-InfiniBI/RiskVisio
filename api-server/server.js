const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
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
    data TEXT
  )`);

  // Risks table
  db.run(`CREATE TABLE IF NOT EXISTS risks (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    probability INTEGER,
    impact INTEGER,
    riskScore INTEGER,
    status TEXT,
    owner TEXT,
    factory TEXT,
    identifiedDate TEXT,
    data TEXT
  )`);

  // Compliance table
  db.run(`CREATE TABLE IF NOT EXISTS compliance (
    id TEXT PRIMARY KEY,
    requirement TEXT,
    regulation TEXT,
    status TEXT,
    priority TEXT,
    owner TEXT,
    factory TEXT,
    dueDate TEXT,
    lastAssessed TEXT,
    data TEXT
  )`);

  console.log('Database initialized successfully');
});

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const clientId = req.headers['x-client-id'];
  const clientSecret = req.headers['x-client-secret'];
  
  if (!clientId || !clientSecret) {
    return res.status(401).json({ 
      error: 'Missing API credentials',
      message: 'Please provide x-client-id and x-client-secret headers'
    });
  }
  
  // In production, validate against your stored API keys
  // For demo purposes, we'll accept any credentials that match the pattern
  if (!clientId.startsWith('key_') || !clientSecret.startsWith('secret_')) {
    return res.status(401).json({ 
      error: 'Invalid API credentials',
      message: 'Invalid client ID or secret format'
    });
  }
  
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'connected'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Risk Management API',
    version: '1.0.0',
    description: 'Production API for integrating risk management data with Power BI',
    endpoints: {
      'GET /api/occurrences': 'Get all occurrences (main data)',
      'GET /api/incidents': 'Get all incidents',
      'GET /api/risks': 'Get all risks',
      'GET /api/compliance': 'Get compliance items',
      'GET /api/factories': 'Get factory information',
      'POST /api/sync': 'Sync data from frontend app'
    },
    authentication: {
      method: 'API Key',
      headers: {
        'x-client-id': 'Your client ID (starts with key_)',
        'x-client-secret': 'Your client secret (starts with secret_)'
      }
    }
  });
});

// Protected endpoints that require API key
app.use('/api', validateApiKey);

// Get all occurrences (your main data)
app.get('/api/occurrences', (req, res) => {
  const { factory, status, type, limit = 1000 } = req.query;
  
  let query = 'SELECT * FROM occurrences WHERE 1=1';
  const params = [];
  
  if (factory) {
    query += ' AND factory = ?';
    params.push(factory);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY createdAt DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    
    // Parse JSON data field if it exists
    const data = rows.map(row => {
      try {
        return row.data ? JSON.parse(row.data) : row;
      } catch {
        return row;
      }
    });
    
    res.json({
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
  });
});

// Get all incidents
app.get('/api/incidents', (req, res) => {
  const { factory, status, type, limit = 1000 } = req.query;
  
  let query = 'SELECT * FROM incidents WHERE 1=1';
  const params = [];
  
  if (factory) {
    query += ' AND factory = ?';
    params.push(factory);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY reportedDate DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    
    res.json({
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  });
});

// Get all risks
app.get('/api/risks', (req, res) => {
  const { factory, category, status, limit = 1000 } = req.query;
  
  let query = 'SELECT * FROM risks WHERE 1=1';
  const params = [];
  
  if (factory) {
    query += ' AND factory = ?';
    params.push(factory);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY riskScore DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    
    res.json({
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  });
});

// Get compliance items
app.get('/api/compliance', (req, res) => {
  const { factory, status, priority, limit = 1000 } = req.query;
  
  let query = 'SELECT * FROM compliance WHERE 1=1';
  const params = [];
  
  if (factory) {
    query += ' AND factory = ?';
    params.push(factory);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  
  query += ' ORDER BY lastAssessed DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    
    res.json({
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  });
});

// Get factory information
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

// Sync endpoint for frontend to push data
app.post('/api/sync', (req, res) => {
  const { type, data } = req.body;
  
  if (!type || !data || !Array.isArray(data)) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'Provide type and data array'
    });
  }
  
  const validTypes = ['occurrences', 'incidents', 'risks', 'compliance'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid type',
      message: `Type must be one of: ${validTypes.join(', ')}`
    });
  }
  
  // Clear existing data and insert new data
  db.serialize(() => {
    db.run(`DELETE FROM ${type}`, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }
      
      if (data.length === 0) {
        return res.json({ message: `${type} data cleared`, count: 0 });
      }
      
      // Insert new data
      const placeholders = Object.keys(data[0]).map(() => '?').join(',');
      const columns = Object.keys(data[0]).join(',');
      const stmt = db.prepare(`INSERT INTO ${type} (${columns}) VALUES (${placeholders})`);
      
      let insertCount = 0;
      data.forEach(item => {
        stmt.run(Object.values(item), (err) => {
          if (err) {
            console.error('Insert error:', err);
          } else {
            insertCount++;
          }
        });
      });
      
      stmt.finalize(() => {
        res.json({ 
          message: `${type} data synced successfully`,
          count: insertCount
        });
      });
    });
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

const server = app.listen(PORT, () => {
  console.log(`🚀 Risk Management API Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`🗃️  Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down gracefully...');
  server.close(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('📦 Database connection closed');
      }
      process.exit(0);
    });
  });
});
