// Test script for API key management
const baseUrl = 'http://localhost:8080';

// Test health endpoint
console.log('🏥 Testing health endpoint...');
fetch(`${baseUrl}/health`)
  .then(response => response.json())
  .then(data => {
    console.log('✅ Health check:', data);
    
    // Test API keys list endpoint (should work without auth in legacy mode)
    console.log('\n🔑 Testing API keys list...');
    return fetch(`${baseUrl}/api/api-keys`);
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ API keys list:', data);
    
    // Test creating a new API key (should work without auth in legacy mode)
    console.log('\n➕ Testing API key creation...');
    return fetch(`${baseUrl}/api/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Test Key', 
        accessType: 'limited', 
        createdBy: 'test-user' 
      })
    });
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ New API key:', data);
    
    if (data.clientId && data.clientSecret) {
      console.log(`\n🔐 Use these credentials to test API calls:`);
      console.log(`Client ID: ${data.clientId}`);
      console.log(`Client Secret: ${data.clientSecret}`);
      
      // Test using the new key to access an endpoint
      console.log('\n🧪 Testing API call with new key...');
      return fetch(`${baseUrl}/api/occurrences`, {
        headers: { 'x-api-key': `${data.clientId}:${data.clientSecret}` }
      });
    }
    return Promise.resolve(null);
  })
  .then(response => {
    if (response) {
      return response.json();
    }
    return null;
  })
  .then(data => {
    if (data) {
      console.log('✅ API call with new key successful!');
      console.log('Response:', data);
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
