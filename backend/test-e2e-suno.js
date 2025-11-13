const axios = require('axios');

async function testEndToEnd() {
  console.log('🧪 Testing End-to-End Song Generation with SunoAPI.org\n');

  const baseUrl = 'http://localhost:5000/api';

  // Test 1: Create a child
  console.log('📍 Step 1: Create a child profile');
  try {
    const childResponse = await axios.post(`${baseUrl}/children`, {
      name: 'TestChild',
      age: 5,
      gender: 'other',
      userId: 'test-user-e2e'
    });
    console.log('✅ Child created:', JSON.stringify(childResponse.data));
    const childId = childResponse.data.childId || childResponse.data.id;

    // Test 2: Generate a song
    console.log('\n📍 Step 2: Generate a song');
    const songResponse = await axios.post(`${baseUrl}/songs/generate`, {
      userId: 'test-user-e2e',
      childIds: [childId],
      topic: 'bedtime stars',
      category: 'bedtime',
      style: 'lullaby',
      customDetails: ''
    });
    console.log('✅ Song generation initiated:', songResponse.data);
    const songId = songResponse.data.songId;

    // Test 3: Check status immediately
    console.log('\n📍 Step 3: Check song status');
    const statusResponse = await axios.get(`${baseUrl}/songs/${songId}/status`);
    console.log('✅ Initial status:', statusResponse.data);

    console.log('\n✅ SUCCESS: End-to-end test passed!');
    console.log('\n📝 Summary:');
    console.log(`   - Child ID: ${childId}`);
    console.log(`   - Song ID: ${songId}`);
    console.log(`   - Status: ${statusResponse.data.status}`);
    console.log(`   - Suno Task ID: ${statusResponse.data.sunoTaskId || 'N/A'}`);

  } catch (error) {
    console.log('❌ Test failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testEndToEnd().catch(console.error);
