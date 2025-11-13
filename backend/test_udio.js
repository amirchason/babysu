require('dotenv').config();
const axios = require('axios');

const PIAPI_KEY = process.env.PIAPI_API_KEY;
const BASE_URL = process.env.PIAPI_BASE_URL || 'https://api.piapi.ai';

console.log('\n🎵 Testing Udio API via PiAPI for BabySu');
console.log('==========================================\n');

async function testUdioAPI() {
  try {
    console.log('📍 API Configuration:');
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   API Key: ${PIAPI_KEY.substring(0, 20)}...${PIAPI_KEY.substring(PIAPI_KEY.length - 10)}\n`);

    // Test 1: Generate a test song
    console.log('🎤 Test 1: Generating Emma\'s Bedtime Lullaby...\n');

    const generatePayload = {
      model: "music-u",
      task_type: "generate_music",
      input: {
        gpt_description_prompt: "gentle bedtime lullaby, soft piano, calm and soothing, perfect for children",
        lyrics_type: "generate",
        title: "Emma's Bedtime Song",
        negative_tags: "",
        seed: -1
      },
      config: {
        service_mode: "public"
      }
    };

    console.log('📤 Request Payload:');
    console.log(JSON.stringify(generatePayload, null, 2));
    console.log('');

    const generateResponse = await axios.post(
      `${BASE_URL}/api/v1/task`,
      generatePayload,
      {
        headers: {
          'X-API-Key': PIAPI_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Song generation request successful!\n');
    console.log('📊 Response:');
    console.log(JSON.stringify(generateResponse.data, null, 2));
    console.log('');

    const taskId = generateResponse.data.data?.task_id;
    if (!taskId) {
      throw new Error('No task_id returned from API');
    }

    console.log(`🎯 Task ID: ${taskId}\n`);

    // Test 2: Check status immediately
    console.log('⏳ Test 2: Checking initial status...\n');

    const statusResponse = await axios.get(
      `${BASE_URL}/api/v1/task/${taskId}`,
      {
        headers: {
          'X-API-Key': PIAPI_KEY,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Status check successful!\n');
    console.log('📊 Status Response:');
    console.log(JSON.stringify(statusResponse.data, null, 2));
    console.log('');

    const status = statusResponse.data.data?.status;
    console.log(`📍 Current Status: ${status}`);

    if (status === 'Completed') {
      const audioUrl = statusResponse.data.data.output?.audio_url;
      const lyrics = statusResponse.data.data.output?.lyrics;
      console.log(`\n🎵 Audio URL: ${audioUrl}`);
      console.log(`\n📝 Lyrics:\n${lyrics}`);
      console.log('\n🎉 SUCCESS! Song is ready!');
    } else {
      console.log('\n⏰ Song is still generating...');
      console.log(`   Status: ${status}`);
      console.log('   Typical generation time: 30-90 seconds');
      console.log(`\n   To check status later, run:`);
      console.log(`   curl -H "X-API-Key: ${PIAPI_KEY}" ${BASE_URL}/api/v1/task/${taskId}`);
    }

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('🚀 Udio API via PiAPI is working correctly!\n');
    console.log('💰 Cost: $0.05 per song generation');
    console.log('🎵 BabySu is ready to generate personalized children\'s music!\n');

    return {
      success: true,
      taskId,
      status
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED!\n');
    console.error('Error details:');
    console.error('  Message:', error.message);
    console.error('  Status:', error.response?.status);
    console.error('  Response:',  JSON.stringify(error.response?.data, null, 2));

    if (error.response?.status === 401) {
      console.error('\n⚠️  API Key appears to be invalid or expired!');
      console.error('   Please check your PIAPI_API_KEY in the .env file');
      console.error('   Get a new key at: https://piapi.ai/dashboard');
    } else if (error.response?.status === 402) {
      console.error('\n⚠️  Insufficient credits!');
      console.error('   Please top up your PiAPI account');
      console.error('   Dashboard: https://piapi.ai/dashboard');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

// Run tests
testUdioAPI().then(result => {
  if (result.success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
