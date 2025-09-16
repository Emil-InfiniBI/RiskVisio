// API Testing Script for RiskVisio
// Run this to test your API endpoints and identify authentication issues

const http = require('http');

const testCases = [
  {
    name: "Health Check",
    method: "GET",
    path: "/health",
    headers: {}
  },
  {
    name: "List API Keys (Bootstrap Mode)",
    method: "GET", 
    path: "/api/api-keys",
    headers: {}
  },
  {
    name: "Create First API Key (Bootstrap)",
    method: "POST",
    path: "/api/api-keys",
    headers: { "Content-Type": "application/json" },
    body: { name: "Test Key", accessType: "full", createdBy: "test" }
  },
  {
    name: "Get Occurrences (No Auth)",
    method: "GET",
    path: "/api/occurrences",
    headers: {}
  },
  {
    name: "Get Occurrences (With Invalid Auth)",
    method: "GET", 
    path: "/api/occurrences",
    headers: {
      "x-client-id": "key_invalid",
      "x-client-secret": "secret_invalid"
    }
  }
];

function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const postData = testCase.body ? JSON.stringify(testCase.body) : null;
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: testCase.path,
      method: testCase.method,
      headers: {
        ...testCase.headers,
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing RiskVisio API...\n');
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      const result = await makeRequest(testCase);
      
      console.log(`  Status: ${result.status}`);
      if (result.body) {
        if (typeof result.body === 'object') {
          console.log(`  Response: ${JSON.stringify(result.body, null, 2)}`);
        } else {
          console.log(`  Response: ${result.body}`);
        }
      }
      console.log('');
      
      // If this was creating an API key, store the credentials for later tests
      if (testCase.name.includes("Create First API Key") && result.status === 200 && result.body) {
        console.log('📝 Storing API credentials for subsequent tests...');
        global.testClientId = result.body.clientId;
        global.testClientSecret = result.body.clientSecret;
        console.log(`  Client ID: ${global.testClientId}`);
        console.log(`  Client Secret: ${global.testClientSecret}\n`);
      }
      
    } catch (error) {
      console.log(`  Error: ${error.message}\n`);
    }
  }
  
  // Additional tests with created credentials
  if (global.testClientId && global.testClientSecret) {
    console.log('🔐 Testing with created API credentials...\n');
    
    const authenticatedTests = [
      {
        name: "Get Occurrences (With Valid Auth)",
        method: "GET",
        path: "/api/occurrences",
        headers: {
          "x-client-id": global.testClientId,
          "x-client-secret": global.testClientSecret
        }
      },
      {
        name: "Create Occurrence (With Valid Auth)",
        method: "POST",
        path: "/api/occurrences",
        headers: {
          "x-client-id": global.testClientId,
          "x-client-secret": global.testClientSecret,
          "Content-Type": "application/json"
        },
        body: {
          title: "Test Occurrence",
          description: "API Test",
          type: "near-miss",
          priority: "medium",
          status: "reported",
          factory: "BTG",
          reportedBy: "api-test"
        }
      }
    ];
    
    for (const testCase of authenticatedTests) {
      try {
        console.log(`Testing: ${testCase.name}`);
        const result = await makeRequest(testCase);
        
        console.log(`  Status: ${result.status}`);
        if (result.body) {
          if (typeof result.body === 'object') {
            console.log(`  Response: ${JSON.stringify(result.body, null, 2)}`);
          } else {
            console.log(`  Response: ${result.body}`);
          }
        }
        console.log('');
        
      } catch (error) {
        console.log(`  Error: ${error.message}\n`);
      }
    }
  }
  
  console.log('✅ API testing complete!');
}

// Check if server is running first
const healthCheck = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/health',
  method: 'GET'
}, (res) => {
  console.log('✅ Server is running, starting tests...\n');
  runTests();
});

healthCheck.on('error', (error) => {
  console.log('❌ Server not running. Please start with: node server.js');
  console.log(`Error: ${error.message}`);
});

healthCheck.end();
