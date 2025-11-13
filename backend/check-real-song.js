const axios = require('axios');

const taskId = 'e0ff2ecdabca4c39d84d6263264c5872';
const apiKey = '146dbdd8ee328ab2ea49e9d318f27489';

async function checkStatus() {
  console.log(`🔍 Checking REAL Suno AI Song Status\n`);
  console.log(`Task ID: ${taskId}\n`);

  try {
    const response = await axios.get(
      `https://api.sunoapi.org/api/v1/generate/record-info`,
      {
        params: { taskId },
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log('📊 REAL STATUS FROM SUNO API:');
    console.log('═══════════════════════════════════════════\n');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n═══════════════════════════════════════════');

    const data = response.data.data;
    if (data) {
      console.log(`\n✅ Status: ${data.status}`);
      console.log(`✅ Type/Model: ${data.type}`);
      console.log(`✅ Operation: ${data.operationType}`);

      if (data.response) {
        console.log('\n🎵 SONG DATA AVAILABLE!');
        const parsed = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
        if (parsed.data && parsed.data[0]) {
          const song = parsed.data[0];
          console.log(`\n🎧 Audio URL: ${song.audio_url || 'Still generating...'}`);
          console.log(`📝 Title: ${song.title || 'N/A'}`);
          console.log(`⏱️  Duration: ${song.duration || 'N/A'} seconds`);
          console.log(`🎼 Lyrics: ${song.lyrics ? song.lyrics.substring(0, 100) + '...' : 'N/A'}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

checkStatus().catch(console.error);
