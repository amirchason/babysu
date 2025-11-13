const axios = require('axios');

async function testSuno() {
  const apiKey = 'sk_fa238a9d2b984eda923c2011c1659dd9';
  const baseUrl = 'https://api.sunoapi.com/v1';

  try {
    console.log('🎵 Testing Suno API connection...\n');

    // Simple test prompt
    const prompt = `Children's pop song, upbeat, cheerful, perfect production

[Verse 1]
Emma wakes up with the morning sun
Emma's ready for a brand new fun

[Chorus]
Emma! Emma! You're so bright today
Emma! Emma! Come on out and play

[Outro]
Emma's song all day long!`;

    console.log('📝 Generating song with prompt:\n', prompt.substring(0, 100) + '...\n');

    const response = await axios.post(
      `${baseUrl}/music/generate`,
      {
        prompt: prompt,
        style: 'pop',
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
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    console.log('\n🎉 Task ID:', response.data.id);
    console.log('⏳ Status:', response.data.status);
    console.log('\n💡 Next: Check status with task ID');

  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testSuno();
