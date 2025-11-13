require('dotenv').config();
const axios = require('axios');

const PIAPI_KEY = process.env.SUNO_API_KEY;
const PIAPI_BASE_URL = process.env.SUNO_API_BASE_URL;

console.log('\n🎵 Testing PiAPI Connection for BabySu');
console.log('=====================================\n');

async function testPiAPI() {
  try {
    console.log('📍 API Configuration:');
    console.log(`   Base URL: ${PIAPI_BASE_URL}`);
    console.log(`   API Key: ${PIAPI_KEY.substring(0, 20)}...${PIAPI_KEY.substring(PIAPI_KEY.length - 10)}\n`);

    // Test 1: Generate a simple song
    console.log('🎤 Test 1: Generating test song...');
    console.log('   Prompt: "Emma\'s bedtime lullaby, gentle and soothing"\n');

    const generateResponse = await axios.post(
      `${PIAPI_BASE_URL}/api/suno/v1/music`,
      {
        custom_mode: false,
        input: {
          gpt_description_prompt: "A gentle bedtime lullaby for a child named Emma, soft and soothing melody",
          make_instrumental: false,
          mv: "chirp-v3-5"
        }
      },
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
    console.log('📊 Response data:');
    console.log(JSON.stringify(generateResponse.data, null, 2));

    const taskId = generateResponse.data.data?.task_id || generateResponse.data.id;
    console.log(`\n🎯 Task ID: ${taskId}`);

    // Test 2: Check status
    console.log('\n⏳ Test 2: Checking song status...\n');

    const statusResponse = await axios.get(
      `${PIAPI_BASE_URL}/api/suno/v1/music/${taskId}`,
      {
        headers: {
          'X-API-Key': PIAPI_KEY,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Status check successful!\n');
    console.log('📊 Status data:');
    console.log(JSON.stringify(statusResponse.data, null, 2));

    const status = statusResponse.data.data?.status || statusResponse.data.status;
    console.log(`\n📍 Current Status: ${status}`);

    if (status === 'completed') {
      const audioUrl = statusResponse.data.data?.audio_url || statusResponse.data.audioUrl;
      console.log(`\n🎵 Audio URL: ${audioUrl}`);
      console.log('\n🎉 SUCCESS! Song is ready to play!');
    } else {
      console.log('\n⏰ Song is still generating. This is normal!');
      console.log('   Typical generation time: 30-60 seconds');
      console.log(`   You can check status later with task ID: ${taskId}`);
    }

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('🚀 PiAPI integration is working correctly!\n');

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
    console.error('  Response:', JSON.stringify(error.response?.data, null, 2));

    return {
      success: false,
      error: error.message
    };
  }
}

// Run tests
testPiAPI().then(result => {
  if (result.success) {
    console.log('🎊 BabySu is ready to generate personalized songs! 🎊\n');
    process.exit(0);
  } else {
    console.log('⚠️  Fix the errors above and try again.\n');
    process.exit(1);
  }
});
