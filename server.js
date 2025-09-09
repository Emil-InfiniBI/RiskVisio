import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

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
