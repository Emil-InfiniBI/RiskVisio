const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'risk_management.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        reject(err);
        return;
      }

      console.log('Setting up database...');

      // Create initial API key
      const clientId = 'key_' + Math.random().toString(36).substring(2, 18);
      const clientSecret = 'secret_' + Math.random().toString(36).substring(2, 34);
      const clientSecretHash = await bcrypt.hash(clientSecret, 10);

      db.run(`
        INSERT OR REPLACE INTO api_keys (
          id, client_id, client_secret_hash, name, enabled, 
          access_type, created_date, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'admin-key-001',
        clientId,
        clientSecretHash,
        'Admin API Key',
        1,
        'full',
        new Date().toISOString(),
        'system'
      ], (err) => {
        if (err) {
          console.error('Error creating admin API key:', err);
          reject(err);
          return;
        }

        console.log('✅ Database setup complete!');
        console.log('');
        console.log('🔑 Your Admin API Key:');
        console.log(`Client ID: ${clientId}`);
        console.log(`Client Secret: ${clientSecret}`);
        console.log('');
        console.log('⚠️  IMPORTANT: Save these credentials! The secret will not be shown again.');
        console.log('');
        console.log('📋 Use these headers in Power BI:');
        console.log(`x-client-id: ${clientId}`);
        console.log(`x-client-secret: ${clientSecret}`);
        
        db.close();
        resolve({ clientId, clientSecret });
      });
    });
  });
}

if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };
