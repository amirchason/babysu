const axios = require('axios');

async function testRealProduction() {
  console.log('🎵 REAL PRODUCTION TEST - Full SunoAPI.org Pipeline\n');
  console.log('⚠️  This will generate a REAL song using your SunoAPI.org credits!\n');

  const baseUrl = 'http://localhost:5000/api';

  try {
    // Step 1: Create a child profile
    console.log('📍 Step 1: Creating child profile...');
    const childResponse = await axios.post(`${baseUrl}/children`, {
      name: 'Luna',
      age: 4,
      gender: 'female',
      userId: 'prod-test-user'
    });
    const childId = childResponse.data.data.childId;
    console.log(`✅ Child created: ${childId}`);

    // Step 2: Generate a REAL song
    console.log('\n📍 Step 2: Generating REAL song with SunoAPI.org...');
    const songResponse = await axios.post(`${baseUrl}/songs/generate`, {
      userId: 'prod-test-user',
      childIds: [childId],
      topic: 'moon and stars',
      category: 'bedtime',
      style: 'lullaby',
      customDetails: 'A gentle lullaby about the moon watching over Luna'
    });

    const songId = songResponse.data.songId;
    console.log(`✅ Song generation initiated: ${songId}`);
    console.log(`   Status: ${songResponse.data.status}`);

    // Step 3: Poll for completion (REAL STATUS)
    console.log('\n📍 Step 3: Polling for completion (this takes 30-90 seconds)...');
    let attempts = 0;
    let maxAttempts = 30; // 5 minutes max
    let completed = false;
    let finalStatus = null;

    while (attempts < maxAttempts && !completed) {
      attempts++;
      await new Promise(r => setTimeout(r, 10000)); // Wait 10 seconds between checks

      const statusResponse = await axios.get(`${baseUrl}/songs/${songId}/status`);
      finalStatus = statusResponse.data;

      console.log(`   [Attempt ${attempts}/${maxAttempts}] Status: ${finalStatus.status}`);

      if (finalStatus.status === 'SUCCESS' || finalStatus.status === 'completed') {
        completed = true;
        console.log('✅ Song generation COMPLETED!');
      } else if (finalStatus.status === 'FAILED' || finalStatus.status === 'failed') {
        console.log('❌ Song generation FAILED');
        break;
      } else {
        console.log(`   ⏳ Still generating... (${finalStatus.status})`);
      }
    }

    // Step 4: Display final result
    console.log('\n📊 FINAL RESULT:');
    console.log('═══════════════════════════════════════════');
    console.log(`Song ID: ${songId}`);
    console.log(`Status: ${finalStatus.status}`);

    if (completed) {
      console.log(`Audio URL: ${finalStatus.audioUrl || 'N/A'}`);
      console.log(`Lyrics: ${finalStatus.lyrics ? finalStatus.lyrics.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`Duration: ${finalStatus.duration || 'N/A'} seconds`);
      console.log(`Title: ${finalStatus.title || 'N/A'}`);
      console.log('═══════════════════════════════════════════');
      console.log('\n🎉 SUCCESS! You now have a REAL Suno AI generated song!');
      console.log(`🎧 Play it here: ${finalStatus.audioUrl}`);
    } else if (!completed && attempts >= maxAttempts) {
      console.log('⏰ Timeout: Song is still generating. Check back later.');
      console.log(`   Song ID: ${songId}`);
    } else {
      console.log('❌ Song generation failed');
    }

  } catch (error) {
    console.error('❌ TEST FAILED:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testRealProduction().catch(console.error);
