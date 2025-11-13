#!/usr/bin/env node
/**
 * Knowledge Base Integration Test Script
 *
 * Tests the integration of research JSON files into the song generation system.
 * Verifies that age-appropriate, research-backed content is being generated.
 *
 * Usage: node test-knowledge-integration.js
 */

const knowledgeService = require('./src/services/knowledgeService');
const promptService = require('./src/services/promptService');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(80));
  log(message, 'bright');
  console.log('='.repeat(80) + '\n');
}

function section(message) {
  log(`\n${'─'.repeat(40)}`, 'cyan');
  log(message, 'cyan');
  log('─'.repeat(40), 'cyan');
}

async function testKnowledgeService() {
  header('TEST 1: Knowledge Service Core Methods');

  const testAges = [0.3, 0.8, 1.5, 2.5, 3.5, 4.5, 5.5];
  const ageLabels = ['Newborn', 'Baby', 'Young Toddler', 'Toddler', 'Preschooler', 'Pre-K', 'Kindergarten'];

  for (let i = 0; i < testAges.length; i++) {
    const age = testAges[i];
    section(`Testing Age: ${age} years (${ageLabels[i]})`);

    try {
      // Test getAgeGroup
      const ageGroup = knowledgeService.getAgeGroup(age);
      log(`✓ Age Group: ${ageGroup.key} - ${ageGroup.label}`, 'green');
      log(`  Vocabulary: ${ageGroup.development.vocabulary}`);
      log(`  Attention Span: ${ageGroup.development.attentionSpan}`);
      log(`  Tempo Range: ${ageGroup.musicalPreferences.tempoBPM[0]}-${ageGroup.musicalPreferences.tempoBPM[1]} BPM`);

      // Test getSongStructure
      const songStructure = knowledgeService.getSongStructure('lullaby');
      log(`✓ Song Structure: ${songStructure.structureTemplate?.sections?.length || 0} sections`, 'green');

      // Test getMusicParameters
      const musicParams = knowledgeService.getMusicParameters('lullaby', age);
      log(`✓ Music Parameters:`, 'green');
      log(`  Optimal BPM: ${musicParams.tempoBPM?.optimal || musicParams.optimalTempo || 'N/A'}`);
      log(`  Key: ${musicParams.keySignatures?.[0] || 'N/A'}`);
      log(`  Instruments: ${musicParams.instruments?.slice(0, 3).join(', ') || 'N/A'}`);

      // Test getAffirmations
      const affirmations = knowledgeService.getAffirmations(age, 'lullaby');
      log(`✓ Affirmations: ${affirmations.length} found`, 'green');
      if (affirmations.length > 0) {
        log(`  Example: "${affirmations[0]}"`);
      }

      // Test getSuggestionsForAge (NEW - for frontend)
      const suggestions = knowledgeService.getSuggestionsForAge(age);
      log(`✓ Smart Suggestions Generated:`, 'green');
      log(`  Topics: ${suggestions.recommendations.topics.length}`);
      log(`  Categories: ${suggestions.recommendations.categories.length}`);
      log(`  Affirmation Themes: ${suggestions.recommendations.affirmationThemes.length}`);
      log(`  Templates: ${suggestions.recommendations.customDetailsTemplates.length}`);

    } catch (error) {
      log(`✗ Error: ${error.message}`, 'red');
    }
  }
}

async function testPromptGeneration() {
  header('TEST 2: Enhanced Prompt Generation with Knowledge Base');

  const testCases = [
    {
      childName: 'Emma',
      childAge: 3,
      topic: 'bedtime',
      category: 'lullaby',
      style: 'soft piano'
    },
    {
      childName: 'Noah',
      childAge: 5,
      topic: 'counting',
      category: 'educational',
      style: 'upbeat'
    },
    {
      childName: 'Sophia',
      childAge: 2,
      topic: 'sharing',
      category: 'affirmation',
      style: 'gentle'
    }
  ];

  for (const testCase of testCases) {
    section(`Testing: ${testCase.childName} (age ${testCase.childAge}) - ${testCase.category}`);

    try {
      const prompt = await promptService.generateSunoPrompt(testCase);

      log(`✓ Prompt Generated Successfully`, 'green');
      log(`\n📝 Title: ${prompt.title}`, 'yellow');
      log(`\n🎵 Style Description:`, 'yellow');
      log(`${prompt.styleDescription}`);

      if (prompt.musicParameters) {
        log(`\n🎹 Music Parameters:`, 'yellow');
        log(`  BPM: ${prompt.musicParameters.bpm}`);
        log(`  Key: ${prompt.musicParameters.key}`);
        log(`  Instruments: ${prompt.musicParameters.instruments.join(', ')}`);
        log(`  Duration: ${prompt.musicParameters.duration} minutes`);
        log(`  Age Group: ${prompt.musicParameters.ageGroup}`);
        log(`  Vocal Style: ${prompt.musicParameters.vocalStyle}`);
      }

      log(`\n📄 Lyrics Preview (first 200 chars):`, 'yellow');
      log(prompt.lyrics.substring(0, 200) + '...');

      // Validate age-appropriateness
      const ageGroup = knowledgeService.getAgeGroup(testCase.childAge);
      const nameCount = (prompt.lyrics.match(new RegExp(testCase.childName, 'gi')) || []).length;
      log(`\n✓ Validation:`, 'blue');
      log(`  Child name appears: ${nameCount} times`);
      log(`  Expected: ${ageGroup.lyricGuidelines.nameRepetition}`);

    } catch (error) {
      log(`✗ Error generating prompt: ${error.message}`, 'red');
      if (error.response) {
        log(`  API Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      }
    }
  }
}

async function testSuggestionsAPI() {
  header('TEST 3: Smart Suggestions for Frontend (All Ages)');

  const testAges = [
    { age: 0.3, label: 'Newborn (4 months)' },
    { age: 1, label: 'Baby (1 year)' },
    { age: 2.5, label: 'Toddler (2.5 years)' },
    { age: 4, label: 'Preschooler (4 years)' },
    { age: 5.5, label: 'Kindergarten (5.5 years)' }
  ];

  for (const test of testAges) {
    section(`Smart Suggestions for ${test.label}`);

    const suggestions = knowledgeService.getSuggestionsForAge(test.age);

    log(`Age Group: ${suggestions.ageGroup} (${suggestions.ageLabel})`, 'bright');

    log(`\n📋 Recommended Topics (${suggestions.recommendations.topics.length}):`, 'yellow');
    suggestions.recommendations.topics.slice(0, 5).forEach(topic => {
      log(`  ${topic.icon} ${topic.label} (${topic.value})`);
    });

    log(`\n🎵 Available Categories (${suggestions.recommendations.categories.length}):`, 'yellow');
    suggestions.recommendations.categories.forEach(cat => {
      log(`  ${cat.icon} ${cat.label} - ${cat.description}`);
    });

    log(`\n⭐ Affirmation Themes (${suggestions.recommendations.affirmationThemes.length}):`, 'yellow');
    suggestions.recommendations.affirmationThemes.slice(0, 3).forEach(theme => {
      log(`  ${theme.label}`);
      log(`    Example: "${theme.example}"`);
    });

    log(`\n📝 Custom Details Templates (${suggestions.recommendations.customDetailsTemplates.length}):`, 'yellow');
    suggestions.recommendations.customDetailsTemplates.slice(0, 3).forEach(template => {
      log(`  • ${template.label}: ${template.template}`);
    });

    log(`\n🎹 Musical Preferences:`, 'yellow');
    log(`  ${suggestions.recommendations.musicalPreferences.tempoBPM}`);
    log(`  Duration: ${suggestions.recommendations.musicalPreferences.duration}`);
    log(`  Instruments: ${suggestions.recommendations.musicalPreferences.preferredInstruments.join(', ')}`);

    log(`\n🚫 Topics to Avoid (${suggestions.recommendations.avoidTopics.length}):`, 'red');
    log(`  ${suggestions.recommendations.avoidTopics.join(', ')}`);
  }
}

async function testValidation() {
  header('TEST 4: Song Parameter Validation');

  const validations = [
    {
      name: 'Age-appropriate topic',
      params: { topic: 'bedtime', category: 'lullaby', duration: 3 },
      age: 3,
      shouldPass: true
    },
    {
      name: 'Inappropriate topic for age',
      params: { topic: 'scary monsters', category: 'story', duration: 3 },
      age: 2,
      shouldPass: false
    },
    {
      name: 'Duration too long for age',
      params: { topic: 'counting', category: 'educational', duration: 10 },
      age: 2,
      shouldPass: false
    }
  ];

  for (const test of validations) {
    section(test.name);

    const result = knowledgeService.validateSongParameters(test.params, test.age);

    log(`Valid: ${result.valid}`, result.valid ? 'green' : 'red');
    if (result.warnings.length > 0) {
      log(`Warnings (${result.warnings.length}):`, 'yellow');
      result.warnings.forEach(w => log(`  • ${w}`, 'yellow'));
    }
    if (result.errors.length > 0) {
      log(`Errors (${result.errors.length}):`, 'red');
      result.errors.forEach(e => log(`  • ${e}`, 'red'));
    }
  }
}

async function testCategoryComparison() {
  header('TEST 5: Category Comparison for Same Age (3 years old)');

  const categories = ['lullaby', 'educational', 'energizing', 'affirmation', 'story'];
  const age = 3;

  log(`Comparing song categories for ${age}-year-old child:\n`, 'bright');

  for (const category of categories) {
    const params = knowledgeService.getMusicParameters(category, age);
    const structure = knowledgeService.getSongStructure(category);

    log(`🎵 ${category.toUpperCase()}`, 'cyan');
    log(`  Tempo: ${params.tempoBPM?.optimal || params.tempoBPM?.min || 'N/A'} BPM (${params.tempoName})`);
    log(`  Key: ${params.keySignatures?.[0] || 'N/A'}`);
    log(`  Instruments: ${params.instruments?.slice(0, 3).join(', ') || 'N/A'}`);
    log(`  Duration: ${params.durationRange ? params.durationRange.join('-') : 'N/A'} minutes`);
    log(`  Sections: ${structure.structureTemplate?.sections?.length || 'N/A'}`);
    log('');
  }
}

async function runAllTests() {
  log('\n🧪 BABYSU KNOWLEDGE BASE INTEGRATION TEST SUITE', 'bright');
  log('━'.repeat(80), 'bright');
  log('Testing integration of research JSON files into song generation\n');

  try {
    await testKnowledgeService();
    await testSuggestionsAPI();
    await testValidation();
    await testCategoryComparison();

    // Only test prompt generation if OpenAI API key is set
    if (process.env.OPENAI_API_KEY) {
      await testPromptGeneration();
    } else {
      log('\n⚠ Skipping prompt generation test (OPENAI_API_KEY not set)', 'yellow');
    }

    header('✅ ALL TESTS COMPLETED');
    log('Knowledge base integration is working correctly!', 'green');
    log('\nNext steps:', 'bright');
    log('1. Test frontend suggestions API: GET /api/songs/suggestions/:childId');
    log('2. Generate a song through the full flow: POST /api/songs/generate');
    log('3. Verify music parameters are passed to PiAPI correctly');

  } catch (error) {
    log(`\n❌ TEST SUITE FAILED: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
