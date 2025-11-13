const axios = require('axios');

async function testSunoUnified() {
  const apiKey = '9d72e171331c936a71c1fe32d164648480a2c1a619f524c31849b00a7a43f583';

  console.log('🧪 Testing Suno via Unified /api/v1/task Endpoint\n');

  // Method: Use unified task endpoint with Suno model parameter
  console.log('📍 POST /api/v1/task (with Suno model)');
  try {
    const response = await axios.post(
      'https://api.piapi.ai/api/v1/task',
      {
        model: 'chirp-v3-5',  // Suno model
        task_type: 'generate_music',
        input: {
          prompt: 'Test lyrics for lullaby',
          title: 'Test Song',
          tags: 'lullaby, soft, gentle',
          lyrics_type: 'user'
        },
        config: {
          service_mode: 'public'
        }
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log('✅ Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }

  // Try with X-API-Key (capitalized)
  console.log('\n📍 POST /api/v1/task (with capitalized X-API-Key)');
  try {
    const response = await axios.post(
      'https://api.piapi.ai/api/v1/task',
      {
        model: 'chirp-v3-5',
        task_type: 'generate_music',
        input: {
          prompt: 'Test lullaby lyrics',
          title: 'Test',
          tags: 'lullaby'
        }
      },
      {
        headers: {
          'X-API-Key': apiKey,  // Capitalized
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log('✅ Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', {
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testSunoUnified().catch(console.error);
