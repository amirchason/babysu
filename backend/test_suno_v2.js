require('dotenv').config();
const axios = require('axios');

async function testSunoAPI() {
  const apiKey = process.env.SUNO_API_KEY;
  const baseUrl = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org';

  console.log('🎵 Testing Suno API with Correct Endpoint\n');
  console.log('📍 Base URL:', baseUrl);
  console.log('🔑 API Key:', apiKey.substring(0, 10) + '...\n');

  try {
    // Test 1: Simple prompt generation
    console.log('🧪 TEST 1: Simple Prompt Generation\n');

    const simplePrompt = "A happy children's song about Emma going to sleep under the stars";

    const response = await axios.post(
      `${baseUrl}/api/v1/generate`,
      {
        prompt: simplePrompt,
        customMode: false,
        instrumental: false,
        model: 'V3_5'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ SUCCESS! API Response:\n');
    console.log(JSON.stringify(response.data, null, 2));

    const taskId = response.data.data?.id || response.data.id;
    const status = response.data.data?.status || response.data.status;

    console.log('\n🎉 Song Generation Started!');
    console.log('📋 Task ID:', taskId);
    console.log('⏳ Status:', status);

    if (response.data.data?.songs) {
      console.log('\n🎵 Songs Generated:');
      response.data.data.songs.forEach((song, index) => {
        console.log(`\n  Song ${index + 1}:`);
        console.log('  - ID:', song.id);
        console.log('  - Title:', song.title);
        console.log('  - Status:', song.status);
        if (song.audio_url) {
          console.log('  - Audio URL:', song.audio_url);
        }
      });
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Wait 30-60 seconds for generation to complete');
    console.log('   2. Check status with task ID');
    console.log('   3. Download audio when ready');

    return response.data;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.response) {
      console.error('\n📊 Response Details:');
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      console.error('   Headers:', error.response.headers);
    }

    if (error.response?.status === 401) {
      console.error('\n🔐 Authentication Error: Check your API key!');
      console.error('   - Go to https://sunoapi.org');
      console.error('   - Verify your API key is correct');
      console.error('   - Make sure you have credits');
    } else if (error.response?.status === 429) {
      console.error('\n⏰ Rate Limit: Too many requests!');
    } else if (error.response?.status === 404) {
      console.error('\n🔍 Endpoint Not Found: Wrong URL or API version');
    }

    throw error;
  }
}

// Run the test
testSunoAPI()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed!');
    process.exit(1);
  });
