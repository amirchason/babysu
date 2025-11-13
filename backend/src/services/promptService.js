const OpenAI = require('openai');
const logger = require('../utils/logger');
const knowledgeService = require('./knowledgeService');

class PromptService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate optimized Suno/Udio AI prompt for children's song
   * ENHANCED with knowledge base integration for age-appropriate, research-backed content
   * @param {Object} options - Song generation options
   * @returns {Promise<{styleDescription: string, lyrics: string, title: string, musicParameters: object}>}
   */
  async generateSunoPrompt(options) {
    const {
      childName,
      childAge,
      topic,
      category,
      style = 'pop',
      customDetails = '',
      siblingName = null
    } = options;

    // ===== KNOWLEDGE BASE INTEGRATION =====
    // Get age-specific guidelines
    const ageGroup = knowledgeService.getAgeGroup(childAge);

    // Get song structure template
    const songStructure = knowledgeService.getSongStructure(category);

    // Get music parameters (BPM, key, instruments, etc.)
    const musicParams = knowledgeService.getMusicParameters(category, childAge);

    // Get relevant affirmations
    const affirmations = knowledgeService.getAffirmations(childAge, category);

    // Get methodology recommendations
    const methodology = knowledgeService.getMethodology(category);

    // Build enhanced system prompt using research data
    const systemPrompt = `You are an expert children's music lyricist and Udio AI prompt engineer, trained in child development and music education methodologies.

=== CHILD PROFILE ===
Name: ${childName}
Age: ${childAge} years (${ageGroup.label})
${siblingName ? `Sibling: ${siblingName}` : ''}

=== TOPIC & CATEGORY ===
Topic: "${topic}"
Category: "${category}"
Style: "${style}"
${customDetails ? `Additional Details: ${customDetails}` : ''}

=== AGE-SPECIFIC DEVELOPMENTAL GUIDELINES ===
**Cognitive Development**: ${ageGroup.development.cognitive}
**Language Skills**: ${ageGroup.development.language}
**Vocabulary Level**: ${ageGroup.development.vocabulary}
**Attention Span**: ${ageGroup.development.attentionSpan}

=== LYRIC WRITING REQUIREMENTS ===
**Sentence Length**: ${ageGroup.lyricGuidelines.sentenceLength}
**Rhyme Scheme**: ${ageGroup.lyricGuidelines.rhymeScheme}
**Name Repetition**: ${ageGroup.lyricGuidelines.nameRepetition}
**Vocabulary**: ${ageGroup.lyricGuidelines.vocabulary}
**Structure**: ${ageGroup.lyricGuidelines.structure}

=== SONG STRUCTURE (${category.toUpperCase()}) ===
${this._formatSongStructureGuide(songStructure, childName)}

=== MUSICAL CHARACTERISTICS ===
**Tempo**: ${musicParams.tempoBPM?.optimal || musicParams.tempoBPM?.min || 90} BPM (${musicParams.tempoName})
**Tempo Range**: ${musicParams.tempoBPM?.min || 60}-${musicParams.tempoBPM?.max || 120} BPM
**Key Signatures**: ${musicParams.keySignatures?.join(', ') || 'C major, G major'}
**Instruments**: ${musicParams.instruments?.join(', ') || 'piano, guitar'}
**Dynamics**: ${musicParams.dynamics || 'moderate'}
**Vocal Style**: ${ageGroup.musicalPreferences?.vocalStyle || 'warm and engaging'}
**Duration**: ${musicParams.durationRange ? `${musicParams.durationRange[0]}-${musicParams.durationRange[1]}` : '2-4'} minutes

=== POSITIVE AFFIRMATIONS TO INCLUDE ===
${affirmations.slice(0, 5).map((aff, i) => `${i + 1}. ${aff}`).join('\n')}

=== MUSIC EDUCATION METHODOLOGY ===
Approach: ${methodology.recommended.join(', ')}
${this._formatMethodologyGuidelines(methodology)}

=== AVOID FOR THIS AGE ===
${ageGroup.avoidTopics?.join(', ') || 'Complex concepts, scary content'}

=== REPETITION & LEARNING ===
Repetition Rate: ${ageGroup.learningModalities?.repetition || '50-60%'} of content should repeat for memory retention
${ageGroup.learningModalities?.callAndResponse ? 'Include call-and-response sections' : ''}

=== YOUR TASK ===
Generate a complete Udio AI prompt following ALL guidelines above.

Return ONLY valid JSON in this exact format:
{
  "title": "Song title featuring ${childName}'s name",
  "styleDescription": "Genre, ${musicParams.tempoBPM?.optimal || 90} BPM, ${musicParams.keySignatures?.[0] || 'C major'}, ${musicParams.instruments?.slice(0, 3).join(', ')}, ${musicParams.dynamics}",
  "lyrics": "Complete song lyrics with [Verse], [Chorus], [Bridge], [Outro] tags"
}

CRITICAL REQUIREMENTS:
✓ Use ${childName}'s name ${ageGroup.lyricGuidelines.nameRepetition}
✓ Match vocabulary to ${ageGroup.development.vocabulary} level
✓ Keep sentences to ${ageGroup.lyricGuidelines.sentenceLength}
✓ Use ${ageGroup.lyricGuidelines.rhymeScheme} rhyme pattern
✓ Include ${affirmations.length > 0 ? 'at least 2 affirmations from the list above' : 'positive affirmations'}
✓ Follow the ${category} song structure template
✓ Keep total length under ${musicParams.durationRange ? musicParams.durationRange[1] : 4} minutes
${siblingName ? `✓ Mention ${siblingName} and their relationship with ${childName}` : ''}
${customDetails ? `✓ Incorporate: ${customDetails}` : ''}

Return ONLY the JSON object, no additional text.`;

    try {
      logger.info('Generating enhanced prompt with knowledge base', {
        childName,
        childAge,
        ageGroup: ageGroup.key,
        topic,
        category,
        tempoBPM: musicParams.tempoBPM?.optimal,
        affirmationsCount: affirmations.length
      });

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert children's music lyricist trained in developmental psychology and music education. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: systemPrompt
          }
        ],
        temperature: 0.85, // Slightly lower for more consistent quality
        max_tokens: 2000, // Increased for detailed prompts
        response_format: { type: "json_object" }
      });

      const generatedText = completion.choices[0].message.content;
      const promptData = JSON.parse(generatedText);

      logger.info('Enhanced prompt generated successfully', {
        title: promptData.title,
        lyricsLength: promptData.lyrics?.length || 0,
        bpm: musicParams.tempoBPM?.optimal,
        ageGroup: ageGroup.key
      });

      // Return enhanced data with music parameters
      return {
        title: promptData.title || `${childName}'s ${topic} Song`,
        styleDescription: promptData.styleDescription || this._buildStyleDescription(musicParams, style, ageGroup),
        lyrics: promptData.lyrics || '',
        // NEW: Return music parameters for PiAPI
        musicParameters: {
          bpm: musicParams.tempoBPM?.optimal || 90,
          key: musicParams.keySignatures?.[0] || 'C major',
          instruments: musicParams.instruments || ['piano', 'guitar'],
          duration: musicParams.durationRange?.[1] || 3,
          dynamics: musicParams.dynamics || 'moderate',
          vocalStyle: ageGroup.musicalPreferences?.vocalStyle || 'warm',
          ageGroup: ageGroup.key
        }
      };
    } catch (error) {
      logger.error('OpenAI API Error (falling back to template)', {
        error: error.message,
        childName,
        topic
      });

      // Fallback to knowledge-based prompt if OpenAI fails
      return this.generateFallbackPrompt(options);
    }
  }

  /**
   * Format song structure guide for system prompt
   * @private
   */
  _formatSongStructureGuide(songStructure, childName) {
    if (!songStructure.structureTemplate?.sections) {
      return 'Standard verse-chorus structure';
    }

    return songStructure.structureTemplate.sections
      .map(section => {
        const example = section.example?.replace(/\[ChildName\]/g, childName) || '';
        return `${section.tag} (${section.lines || 4} lines): ${section.description || ''}\n  Example: ${example}`;
      })
      .join('\n');
  }

  /**
   * Format methodology guidelines
   * @private
   */
  _formatMethodologyGuidelines(methodology) {
    if (!methodology.data || Object.keys(methodology.data).length === 0) {
      return 'Use playful, engaging approach';
    }

    const methodNames = methodology.recommended.slice(0, 2); // Top 2 methods
    return methodNames.map(method => {
      const data = methodology.data[method];
      if (!data) return '';
      return `- ${data.name || method}: ${data.philosophy || ''}`;
    }).join('\n');
  }

  /**
   * Build style description from music parameters
   * @private
   */
  _buildStyleDescription(musicParams, style, ageGroup) {
    const bpm = musicParams.tempoBPM?.optimal || 90;
    const key = musicParams.keySignatures?.[0] || 'C major';
    const instruments = musicParams.instruments?.slice(0, 3).join(', ') || 'piano, guitar';
    const mood = ageGroup.musicalPreferences?.tempoDescription || 'gentle and playful';

    return `${style} children's song, ${bpm} BPM, ${key}, ${instruments}, ${mood}, ${musicParams.dynamics || 'moderate dynamics'}`;
  }

  /**
   * Generate fallback prompt if OpenAI fails
   * ENHANCED with knowledge base for age-appropriate fallback
   * @param {Object} options
   * @returns {Object}
   */
  generateFallbackPrompt(options) {
    const { childName, childAge, topic, category, style } = options;

    // Use knowledge base even for fallback
    const ageGroup = knowledgeService.getAgeGroup(childAge);
    const musicParams = knowledgeService.getMusicParameters(category, childAge);
    const affirmations = knowledgeService.getAffirmations(childAge, category);

    // Build age-appropriate fallback styleDescription
    const styleDesc = this._buildStyleDescription(musicParams, style || category, ageGroup);

    return {
      title: `${childName}'s ${topic} Song`,
      styleDescription: styleDesc,
      lyrics: `[Verse 1]
${childName}, ${childName}, time for ${topic}
Let's make it fun, let's make it bright
${childName} is special, ${childName} is sweet
Tonight we'll make everything right

[Chorus]
${childName}, ${childName}, you're doing great
${topic} time is the best
${childName}, ${childName}, don't you wait
You deserve the very best

[Verse 2]
${childName} knows just what to do
Learning and growing every day
${childName}'s smile shines through and through
In every single way

[Chorus]
${childName}, ${childName}, you're doing great
${topic} time is the best
${childName}, ${childName}, don't you wait
You deserve the very best

[Bridge]
We're so proud of ${childName} today
Growing stronger in every way
${childName}'s the star of our show
Watch our little ${childName} grow

[Outro]
${childName}, ${childName}, sleep tight
Tomorrow's another day
${childName}, ${childName}, goodnight
Dream big, laugh, and play`,
      // Include music parameters even in fallback
      musicParameters: {
        bpm: musicParams.tempoBPM?.optimal || 90,
        key: musicParams.keySignatures?.[0] || 'C major',
        instruments: musicParams.instruments || ['piano', 'guitar'],
        duration: musicParams.durationRange?.[1] || 3,
        dynamics: musicParams.dynamics || 'moderate',
        vocalStyle: ageGroup.musicalPreferences?.vocalStyle || 'warm',
        ageGroup: ageGroup.key
      }
    };
  }

  /**
   * Generate personalized song topic suggestions based on child's age
   * @param {string} childName - Child's name
   * @param {number} childAge - Child's age
   * @returns {Promise<string[]>} - Array of topic suggestions
   */
  async generateTopicSuggestions(childName, childAge) {
    const prompt = `For a ${childAge}-year-old child named ${childName}, suggest 10 personalized song topics that would help with common parenting challenges appropriate for this age.

Consider age-appropriate issues like:
- Daily routines (bedtime, morning, meals)
- Emotional regulation (tantrums, fears, frustration)
- Social skills (sharing, friendship, kindness)
- Learning concepts (ABCs, numbers, colors)
- Life skills (potty training, manners, safety)

Return ONLY a valid JSON array of strings:
{"topics": ["topic 1", "topic 2", ...]}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a parenting expert. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      return response.topics || response.suggestions || [];
    } catch (error) {
      logger.error('Topic suggestions generation error', {
        error: error.message,
        childName,
        childAge
      });

      // Return fallback suggestions
      return this.getFallbackTopics(childAge);
    }
  }

  /**
   * Fallback topic suggestions if AI fails
   * @param {number} childAge
   * @returns {string[]}
   */
  getFallbackTopics(childAge) {
    const topicsByAge = {
      'toddler': [
        "Bedtime lullaby",
        "Bath time fun",
        "Eating healthy food",
        "Learning animal sounds",
        "Potty training encouragement"
      ],
      'preschool': [
        "Morning routine",
        "Sharing with friends",
        "Trying new foods",
        "Brushing teeth",
        "Being brave",
        "Cleaning up toys",
        "Saying please and thank you"
      ],
      'elementary': [
        "Homework motivation",
        "Making new friends",
        "Dealing with bullies",
        "Managing anger",
        "Reading time",
        "Responsibility"
      ],
      'preteen': [
        "Self-confidence",
        "Teamwork",
        "Handling disappointment",
        "Time management",
        "Being yourself"
      ]
    };

    if (childAge <= 2) return topicsByAge.toddler;
    if (childAge <= 5) return topicsByAge.preschool;
    if (childAge <= 8) return topicsByAge.elementary;
    return topicsByAge.preteen;
  }
}

module.exports = new PromptService();
