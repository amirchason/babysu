const axios = require('axios');

async function testSunoAPI() {
  const apiKey = '146dbdd8ee328ab2ea49e9d318f27489';
  const baseUrl = 'https://api.sunoapi.org';

  console.log('🧪 Testing SunoAPI.org Integration\n');

  // Test 1: Check credits
  console.log('📍 Test 1: Check API credits');
  try {
    const response = await axios.get(
      `${baseUrl}/api/v1/get-credits`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log('✅ Credits check:', response.data);
  } catch (error) {
    console.log('❌ Credits error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }

  // Test 2: Generate music
  console.log('\n📍 Test 2: Generate music');
  try {
    const response = await axios.post(
      `${baseUrl}/api/v1/generate`,
      {
        prompt: 'A gentle lullaby with soft piano and soothing vocals, perfect for bedtime',
        model: 'V3_5',
        customMode: true,
        instrumental: false,  // Required parameter
        style: 'lullaby',
        title: 'Test Lullaby',
        callBackUrl: 'https://webhook.site/test'  // Dummy webhook URL
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    console.log('✅ Generate response:', JSON.stringify(response.data, null, 2));

    // Test 3: Check status
    if (response.data.data?.taskId) {
      console.log('\n📍 Test 3: Check task status');
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds

      const statusResponse = await axios.get(
        `${baseUrl}/api/v1/generate/record-info?taskId=${response.data.data.taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 10000
        }
      );
      console.log('✅ Status response:', JSON.stringify(statusResponse.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Generation error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testSunoAPI().catch(console.error);
