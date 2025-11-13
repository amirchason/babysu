const axios = require('axios');

async function testPiAPI() {
  const apiKey = '9d72e171331c936a71c1fe32d164648480a2c1a619f524c31849b00a7a43f583';

  console.log('🧪 Testing PiAPI Suno Endpoint...\n');

  // Test 1: Suno Generation Endpoint
  console.log('📍 Test 1: POST /api/suno/v1/music');
  try {
    const response = await axios.post(
      'https://api.piapi.ai/api/suno/v1/music',
      {
        custom_mode: true,
        mv: 'chirp-v3-5',
        input: {
          prompt: 'Test lyrics for lullaby',
          title: 'Test Song',
          tags: 'lullaby, soft, gentle'
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
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }

  console.log('\n📍 Test 2: POST /api/v1/task (Udio/Unified)');
  // Test 2: Unified Task Endpoint (Udio)
  try {
    const response = await axios.post(
      'https://api.piapi.ai/api/v1/task',
      {
        model: 'music-u',
        task_type: 'generate_music',
        input: {
          gpt_description_prompt: 'A gentle lullaby with soft piano',
          lyrics_type: 'generate',
          negative_tags: '',
          seed: -1
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
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }

  console.log('\n📍 Test 3: GET account/credits info');
  // Test 3: Check API key validity
  try {
    const response = await axios.get(
      'https://api.piapi.ai/api/v1/user',
      {
        headers: {
          'x-api-key': apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

testPiAPI().catch(console.error);
