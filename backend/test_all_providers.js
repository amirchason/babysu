require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.SUNO_API_KEY;

const providers = [
  {
    name: 'SunoAPI.com (v1/suno/create)',
    baseUrl: 'https://api.sunoapi.com/v1',
    endpoint: '/suno/create',
    authType: 'Bearer',
    requestBody: {
      prompt: "A gentle lullaby about Emma",
      model: 'sonic',
      make_instrumental: false
    }
  },
  {
    name: 'SunoAPI.com (v1/generate)',
    baseUrl: 'https://api.sunoapi.com/v1',
    endpoint: '/generate',
    authType: 'Bearer',
    requestBody: {
      prompt: "A gentle lullaby about Emma",
      model: 'sonic'
    }
  },
  {
    name: 'SunoAPI.org',
    baseUrl: 'https://api.sunoapi.org',
    endpoint: '/api/v1/generate',
    authType: 'Bearer',
    requestBody: {
      prompt: "A gentle lullaby about Emma",
      customMode: false,
      instrumental: false,
      model: 'V3_5'
    }
  },
  {
    name: 'LaoZhang.AI',
    baseUrl: 'https://api.laozhang.ai',
    endpoint: '/v1/suno/generate',
    authType: 'Bearer',
    requestBody: {
      model: "suno-v4",
      prompt: "A gentle lullaby about Emma",
      options: {
        duration: 60
      }
    }
  },
  {
    name: 'PiAPI',
    baseUrl: 'https://api.piapi.ai',
    endpoint: '/api/suno/v1/music',
    authType: 'X-API-Key',
    requestBody: {
      custom_mode: false,
      input: {
        gpt_description_prompt: "A gentle lullaby about Emma",
        make_instrumental: false
      }
    }
  },
  {
    name: 'GoAPI.ai',
    baseUrl: 'https://api.goapi.ai',
    endpoint: '/api/suno/v1/music',
    authType: 'X-API-Key',
    requestBody: {
      custom_mode: false,
      input: {
        gpt_description_prompt: "A gentle lullaby about Emma",
        make_instrumental: false
      }
    }
  },
  {
    name: 'CometAPI',
    baseUrl: 'https://api.cometapi.com',
    endpoint: '/suno/submit/music',
    authType: 'Bearer',
    requestBody: {
      prompt: "A gentle lullaby about Emma"
    }
  }
];

async function testProvider(provider) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${provider.name}`);
  console.log(`📍 URL: ${provider.baseUrl}${provider.endpoint}`);
  console.log(`🔐 Auth: ${provider.authType}`);

  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (provider.authType === 'Bearer') {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    } else if (provider.authType === 'X-API-Key') {
      headers['X-API-Key'] = API_KEY;
    }

    const response = await axios.post(
      `${provider.baseUrl}${provider.endpoint}`,
      provider.requestBody,
      {
        headers,
        timeout: 15000
      }
    );

    console.log(`\n✅ SUCCESS! This is your provider!\n`);
    console.log(`📊 Response:`, JSON.stringify(response.data, null, 2));

    return {
      success: true,
      provider: provider.name,
      data: response.data
    };

  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    console.log(`❌ Failed with status: ${status}`);

    if (status === 401) {
      console.log(`   Reason: Unauthorized (wrong provider or invalid key)`);
    } else if (status === 402) {
      console.log(`   Reason: Payment Required (no credits) - BUT AUTH WORKED! ✅`);
      console.log(`   🎉 This might be your provider! Top up credits at their website.`);
      return {
        success: 'maybe',
        provider: provider.name,
        reason: 'Out of credits but auth worked'
      };
    } else if (status === 404) {
      console.log(`   Reason: Endpoint not found (wrong URL structure)`);
    } else if (status === 405) {
      console.log(`   Reason: Method not allowed (wrong endpoint path)`);
    } else if (status === 429) {
      console.log(`   Reason: Rate limited (too many requests)`);
    } else {
      console.log(`   Error: ${error.message}`);
      if (data) {
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      }
    }

    return {
      success: false,
      provider: provider.name,
      status,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('\n🎵 SUNO API PROVIDER DETECTION');
  console.log('='.repeat(60));
  console.log(`\n🔑 Testing API Key: ${API_KEY.substring(0, 15)}...`);
  console.log(`\n⏳ Testing ${providers.length} providers...\n`);

  const results = [];

  for (const provider of providers) {
    const result = await testProvider(provider);
    results.push(result);

    // If we found a working provider, stop
    if (result.success === true) {
      console.log(`\n\n${'='.repeat(60)}`);
      console.log(`🎉 FOUND YOUR PROVIDER: ${provider.name}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`\n📝 Next Steps:`);
      console.log(`   1. Update .env with:`);
      console.log(`      SUNO_API_BASE_URL=${provider.baseUrl}`);
      console.log(`   2. Update sunoService.js endpoint to: ${provider.endpoint}`);
      console.log(`   3. Test song generation!`);
      break;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`📊 TEST SUMMARY`);
  console.log(`${'='.repeat(60)}\n`);

  const maybeProviders = results.filter(r => r.success === 'maybe');
  const failedProviders = results.filter(r => r.success === false);

  if (maybeProviders.length > 0) {
    console.log(`\n⚠️  POSSIBLE PROVIDERS (out of credits):`);
    maybeProviders.forEach(r => {
      console.log(`   - ${r.provider}: ${r.reason}`);
    });
  }

  const successProviders = results.filter(r => r.success === true);
  if (successProviders.length === 0 && maybeProviders.length === 0) {
    console.log(`\n❌ No working provider found with this API key.`);
    console.log(`\n💡 Possible reasons:`);
    console.log(`   1. API key is from a provider not in our list`);
    console.log(`   2. API key is expired or invalid`);
    console.log(`   3. Need to check provider dashboard for correct endpoint`);
    console.log(`\n🔍 Next steps:`);
    console.log(`   1. Log into the provider dashboard where you got the key`);
    console.log(`   2. Check their API documentation`);
    console.log(`   3. OR sign up for PiAPI: https://piapi.ai/suno-api`);
    console.log(`      (Clear docs, $0.02/song, well-supported)`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

// Run all tests
runAllTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });
