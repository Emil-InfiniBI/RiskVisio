// 🔧 API Authentication Middleware Fix
// This file contains the corrected authentication middleware for the main server

import { createHash } from 'crypto';

function hashSecret(secret) {
  return createHash('sha256').update(secret).digest('hex');
}

// Improved API authentication middleware
export function createAuthMiddleware(db, SINGLE_API_KEY, ADMIN_KEY) {
  return (req, res, next) => {
    // Skip authentication for health check
    if (req.path === '/health') {
      return next();
    }

    const isKeyManagement = req.path.startsWith('/api/api-keys');
    
    // Legacy single API key mode
    if (SINGLE_API_KEY) {
      // For key management endpoints, also check admin key if configured
      if (isKeyManagement && ['POST', 'DELETE'].includes(req.method) && ADMIN_KEY) {
        const adminHeader = req.header('x-admin-key');
        if (adminHeader !== ADMIN_KEY) {
          return res.status(401).json({ 
            error: 'Admin key required for key management operations',
            hint: 'Provide x-admin-key header'
          });
        }
      } else if (!isKeyManagement) {
        // Regular API calls with legacy key
        const provided = req.header('x-api-key') || req.query.api_key;
        if (provided !== SINGLE_API_KEY) {
          return res.status(401).json({ 
            error: 'Unauthorized: invalid API key',
            hint: 'Provide valid x-api-key header'
          });
        }
      }
      return next();
    }

    // Dual credential mode - check if any keys exist first
    db.get('SELECT COUNT(*) as cnt FROM api_keys WHERE enabled = 1 AND revokedDate IS NULL', (err, row) => {
      if (err) {
        console.error('Database error in auth middleware:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const haveKeys = row?.cnt > 0;
      
      // Bootstrap mode - open access when no keys exist (except for GET requests on key management)
      if (!haveKeys) {
        // Allow creation of first API key without authentication
        if (isKeyManagement && req.method === 'POST') {
          return next();
        }
        // Allow listing keys to check if any exist
        if (isKeyManagement && req.method === 'GET') {
          return next();
        }
        // For all other endpoints, allow access during bootstrap
        if (!isKeyManagement) {
          return next();
        }
      }

      // Production mode - require both client ID and secret
      const clientId = req.header('x-client-id') || req.header('x-api-key') || req.query.client_id || req.query.api_key;
      const clientSecret = req.header('x-client-secret') || req.query.client_secret;

      // For key management operations, check admin key if configured
      if (isKeyManagement && ['POST', 'DELETE'].includes(req.method) && ADMIN_KEY) {
        const adminHeader = req.header('x-admin-key');
        if (adminHeader !== ADMIN_KEY) {
          return res.status(401).json({ 
            error: 'Admin key required for key management operations',
            hint: 'Provide x-admin-key header with valid admin key'
          });
        }
      }

      if (!clientId || !clientSecret) {
        return res.status(401).json({ 
          error: 'Client ID and Client Secret required',
          hint: 'Provide both x-client-id and x-client-secret headers',
          authMode: 'dual-credential'
        });
      }

      // Validate credentials against database
      db.get('SELECT * FROM api_keys WHERE clientId = ? AND enabled = 1 AND revokedDate IS NULL', [clientId], (err2, keyRow) => {
        if (err2) {
          console.error('Database error validating API key:', err2);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!keyRow) {
          return res.status(401).json({ 
            error: 'Invalid API key',
            hint: 'Client ID not found or key is disabled/revoked'
          });
        }

        // Verify secret hash
        const providedHash = hashSecret(clientSecret);
        if (providedHash !== keyRow.secretHash) {
          return res.status(401).json({ 
            error: 'Invalid client secret',
            hint: 'Client secret does not match'
          });
        }

        // Check access level for write operations (except key management)
        if (req.method === 'POST' && !isKeyManagement && keyRow.accessType !== 'full') {
          return res.status(403).json({ 
            error: 'Insufficient privileges',
            hint: 'Write operations require full access key'
          });
        }

        // Update lastUsed timestamp asynchronously
        db.run('UPDATE api_keys SET lastUsed = ? WHERE id = ?', [new Date().toISOString(), keyRow.id], (updateErr) => {
          if (updateErr) {
            console.warn('Failed to update lastUsed timestamp:', updateErr);
          }
        });

        // Add key info to request for potential use in handlers
        req.apiKey = keyRow;
        next();
      });
    });
  };
}

// Error handler for authentication issues
export function authErrorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  next(err);
}

// Helper function to validate API key format
export function validateApiKeyFormat(clientId, clientSecret) {
  const errors = [];
  
  if (!clientId || typeof clientId !== 'string') {
    errors.push('Client ID is required and must be a string');
  } else if (!clientId.startsWith('key_')) {
    errors.push('Client ID must start with "key_"');
  }
  
  if (!clientSecret || typeof clientSecret !== 'string') {
    errors.push('Client Secret is required and must be a string');
  } else if (!clientSecret.startsWith('secret_')) {
    errors.push('Client Secret must start with "secret_"');
  }
  
  return errors;
}

export { hashSecret };
