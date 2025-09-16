// Test script for API key management using http module
import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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

async function testAPI() {
  try {
    console.log('🏥 Testing health endpoint...');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/health',
      method: 'GET'
    });
    console.log('✅ Health check:', health.data);

    console.log('\n🔑 Testing API keys list...');
    const keysList = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/api-keys',
      method: 'GET'
    });
    console.log('✅ API keys list:', keysList.data);

    console.log('\n➕ Testing API key creation...');
    const newKey = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/api-keys',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({
      name: 'Test Key',
      accessType: 'limited',
      createdBy: 'test-user'
    }));
    console.log('✅ New API key:', newKey.data);

    if (newKey.data.clientId && newKey.data.clientSecret) {
      console.log(`\n🔐 Testing API call with new credentials:`);
      console.log(`Client ID: ${newKey.data.clientId}`);
      console.log(`Client Secret: ${newKey.data.clientSecret}`);

      const apiTest = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/occurrences',
        method: 'GET',
        headers: {
          'x-api-key': `${newKey.data.clientId}:${newKey.data.clientSecret}`
        }
      });
      console.log('✅ API call with new key:', apiTest.status === 200 ? 'Success!' : 'Failed');
      console.log('Response:', apiTest.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
