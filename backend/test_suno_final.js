require('dotenv').config();
const axios = require('axios');

async function testSunoAPI() {
  const apiKey = process.env.SUNO_API_KEY;
  const baseUrl = 'https://api.sunoapi.com/v1';

  console.log('🎵 Testing Suno API (sunoapi.com)\n');
  console.log('📍 Base URL:', baseUrl);
  console.log('🔑 API Key:', apiKey.substring(0, 15) + '...\n');

  try {
    // Test with simple prompt
    console.log('🧪 Generating Emma\'s Bedtime Lullaby...\n');

    const prompt = "A gentle lullaby about Emma falling asleep under the twinkling stars, with her teddy bear by her side";

    const response = await axios.post(
      `${baseUrl}/suno/create`,
      {
        prompt: prompt,
        model: 'sonic', // sonic = 2 songs per generation
        make_instrumental: false,
        wait_audio: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ SUCCESS! Song generation started!\n');
    console.log('📊 Full Response:');
    console.log(JSON.stringify(response.data, null, 2));

    const taskId = response.data.data?.task_id || response.data.task_id;

    if (taskId) {
      console.log('\n🎉 Task ID:', taskId);
      console.log('⏳ Status: Generating...');
      console.log('\n💡 Next Steps:');
      console.log('   1. Wait 30-60 seconds for generation');
      console.log('   2. Check task status with ID:', taskId);
      console.log('   3. Download audio files when ready');
    }

    return response.data;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.response) {
      console.error('\n📊 Response Details:');
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 401) {
        console.error('\n🔐 Authentication Failed!');
        console.error('   - Verify API key at: https://sunoapi.com/dashboard/apikey');
        console.error('   - Check if you have credits (30 free for new users)');
      } else if (error.response.status === 402) {
        console.error('\n💳 Payment Required: Out of credits!');
        console.error('   - Top up at: https://sunoapi.com/pricing');
      }
    }

    throw error;
  }
}

// Run test
testSunoAPI()
  .then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
  })
  .catch(() => {
    console.error('\n💥 Test failed!');
    process.exit(1);
  });
