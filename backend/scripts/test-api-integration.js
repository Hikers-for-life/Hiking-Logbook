import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

// You'll need to get a real token - replace this with your actual Firebase token
const TEST_TOKEN = 'your-firebase-token-here';

async function testApiIntegration() {
  console.log('🧪 Testing API Integration with Firestore...\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  };

  try {
    console.log('1. Testing GET /api/hikes (should load from Firestore)');
    const getResponse = await fetch(`${API_BASE_URL}/hikes`, {
      method: 'GET',
      headers
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET Success:', data);
    } else {
      console.log('❌ GET Failed:', getResponse.status, await getResponse.text());
    }

    console.log('\n2. Testing POST /api/hikes (should create in Firestore)');
    const postResponse = await fetch(`${API_BASE_URL}/hikes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Test API Hike',
        location: 'Test Location',
        date: new Date().toISOString(),
        distance: '5.0',
        elevation: '1000',
        duration: '2h 30m',
        weather: 'Sunny, 20°C',
        difficulty: 'Easy',
        notes: 'Testing API integration'
      })
    });

    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('✅ POST Success:', data);
      
      // Test DELETE with the created hike
      if (data.success && data.data && data.data.id) {
        console.log('\n3. Testing DELETE /api/hikes/:id (should remove from Firestore)');
        const deleteResponse = await fetch(`${API_BASE_URL}/hikes/${data.data.id}`, {
          method: 'DELETE',
          headers
        });
        
        if (deleteResponse.ok) {
          const deleteData = await deleteResponse.json();
          console.log('✅ DELETE Success:', deleteData);
        } else {
          console.log('❌ DELETE Failed:', deleteResponse.status, await deleteResponse.text());
        }
      }
    } else {
      console.log('❌ POST Failed:', postResponse.status, await postResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (TEST_TOKEN === 'your-firebase-token-here') {
      console.log('\n💡 You need to replace TEST_TOKEN with a real Firebase token.');
      console.log('   Get one from the browser console after logging into your app:');
      console.log('   firebase.auth().currentUser.getIdToken().then(token => console.log(token))');
    }
  }
}

testApiIntegration();
