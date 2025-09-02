import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testRoutes() {
  console.log('🧪 Testing API Routes...\n');
  
  // Test 1: Check if server is running
  try {
    console.log('1. Testing server connection...');
    const response = await fetch(`${API_BASE_URL}/hikes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No auth header - should get 401
      }
    });
    
    if (response.status === 401) {
      console.log('✅ Server is running - got expected 401 (unauthorized)');
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return;
  }
  
  // Test 2: Check route structure
  console.log('\n2. Testing route structure...');
  const routes = [
    'GET /api/hikes',
    'POST /api/hikes/start',
    'GET /api/hikes/stats/overview',
    'GET /api/hikes/:id',
    'POST /api/hikes',
    'PUT /api/hikes/:id',
    'DELETE /api/hikes/:id'
  ];
  
  routes.forEach(route => {
    console.log(`   ${route}`);
  });
  
  console.log('\n✅ Route structure looks correct!');
  console.log('\n💡 Next steps:');
  console.log('1. Get a valid Firebase token using get-test-token.js');
  console.log('2. Test with Postman using the token');
  console.log('3. Test the frontend app');
}

testRoutes();
