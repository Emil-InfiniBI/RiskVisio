const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
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
    updatedAt TEXT
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
    assignedTo TEXT,
    rootCause TEXT,
    actions TEXT,
    evidence TEXT,
    tags TEXT
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
    reviewDate TEXT,
    mitigationStrategy TEXT,
    currentControls TEXT,
    targetRiskScore INTEGER
  )`);

  // API Keys table
  db.run(`CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    clientId TEXT UNIQUE,
    clientSecret TEXT,
    name TEXT,
    enabled BOOLEAN,
    accessType TEXT,
    createdDate TEXT,
    createdBy TEXT
  )`);
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

  db.get(
    'SELECT * FROM api_keys WHERE clientId = ? AND clientSecret = ? AND enabled = 1',
    [clientId, clientSecret],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(401).json({ error: 'Invalid API credentials' });
      }
      req.apiKey = row;
      next();
    }
  );
};

// Public endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Risk Management API',
    version: '1.0.0',
    description: 'API for integrating risk management data with Power BI',
    endpoints: {
      'GET /api/occurrences': 'Get all occurrences',
      'GET /api/incidents': 'Get all incidents', 
      'GET /api/risks': 'Get all risks',
      'POST /api/sync': 'Sync data from frontend app'
    },
    authentication: {
      method: 'API Key',
      headers: {
        'x-client-id': 'Your client ID',
        'x-client-secret': 'Your client secret'
      }
    }
  });
});

// Protected endpoints
app.use('/api', validateApiKey);

// Get occurrences
app.get('/api/occurrences', (req, res) => {
  const { factory, status, type } = req.query;
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
  
  db.all(query, params, (err, rows) => {
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

// Get incidents
app.get('/api/incidents', (req, res) => {
  const { factory, status, type } = req.query;
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
  
  db.all(query, params, (err, rows) => {
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

// Get risks
app.get('/api/risks', (req, res) => {
  const { factory, status, category } = req.query;
  let query = 'SELECT * FROM risks WHERE 1=1';
  const params = [];
  
  if (factory) {
    query += ' AND factory = ?';
    params.push(factory);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  db.all(query, params, (err, rows) => {
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

// Sync data from frontend
app.post('/api/sync', (req, res) => {
  const { occurrences, incidents, risks } = req.body;
  
  // Clear existing data and insert new data
  db.serialize(() => {
    if (occurrences) {
      db.run('DELETE FROM occurrences');
      const stmt = db.prepare(`INSERT INTO occurrences 
        (id, title, description, type, priority, status, factory, location, reportedBy, reportedDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      occurrences.forEach(item => {
        stmt.run([
          item.id, item.title, item.description, item.type, item.priority,
          item.status, item.factory, item.location, item.reportedBy,
          item.reportedDate, item.createdAt, item.updatedAt
        ]);
      });
      stmt.finalize();
    }
    
    if (incidents) {
      db.run('DELETE FROM incidents');
      const stmt = db.prepare(`INSERT INTO incidents 
        (id, title, description, type, severity, status, factory, location, reportedBy, reportedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      incidents.forEach(item => {
        stmt.run([
          item.id, item.title, item.description, item.type, item.severity,
          item.status, item.factory, item.location, item.reportedBy, item.reportedDate
        ]);
      });
      stmt.finalize();
    }
    
    if (risks) {
      db.run('DELETE FROM risks');
      const stmt = db.prepare(`INSERT INTO risks 
        (id, title, description, category, probability, impact, riskScore, status, owner, factory, identifiedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      risks.forEach(item => {
        stmt.run([
          item.id, item.title, item.description, item.category, item.probability,
          item.impact, item.riskScore, item.status, item.owner, item.factory, item.identifiedDate
        ]);
      });
      stmt.finalize();
    }
  });
  
  res.json({ success: true, message: 'Data synced successfully' });
});

// Create API key
app.post('/api/keys', (req, res) => {
  const { name, accessType } = req.body;
  const clientId = `key_${Math.random().toString(36).substring(2, 18)}`;
  const clientSecret = `secret_${Math.random().toString(36).substring(2, 34)}`;
  const id = Math.random().toString(36).substring(2, 15);
  
  db.run(
    `INSERT INTO api_keys (id, clientId, clientSecret, name, enabled, accessType, createdDate, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, clientId, clientSecret, name, 1, accessType, new Date().toISOString(), 'admin'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create API key' });
      }
      res.json({
        id,
        clientId,
        clientSecret,
        name,
        accessType,
        createdDate: new Date().toISOString()
      });
    }
  );
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Risk Management API Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health\n`);
});
