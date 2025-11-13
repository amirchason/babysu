/**
 * Knowledge Service
 *
 * Provides access to research-backed child development and music education data.
 * Powers both backend song generation and frontend smart UI suggestions.
 *
 * Data Sources:
 * - ageGuidelines.json: Age-specific development milestones and music preferences
 * - songStructures.json: Song type templates and structural guidelines
 * - musicParameters.json: Musical theory parameters (BPM, keys, instruments)
 * - affirmations.json: Positive affirmations database by age and category
 * - educationMethods.json: Proven music education methodologies
 */

const ageGuidelines = require('../knowledge/ageGuidelines.json');
const songStructures = require('../knowledge/songStructures.json');
const musicParameters = require('../knowledge/musicParameters.json');
const affirmations = require('../knowledge/affirmations.json');
const educationMethods = require('../knowledge/educationMethods.json');

class KnowledgeService {
  constructor() {
    this.ageGroups = ageGuidelines.ageGroups;
    this.songTypes = songStructures.songTypes;
    this.musicParams = musicParameters;
    this.affirmationsDb = affirmations;
    this.methods = educationMethods;
  }

  /**
   * Get age group data for a specific child age
   * @param {number} ageInYears - Child's age in years (e.g., 0.5, 1, 2.5, 3)
   * @returns {object} Age group data including development, musical preferences, etc.
   */
  getAgeGroup(ageInYears) {
    // Determine which age group the child belongs to
    const ageGroupKey = this._determineAgeGroup(ageInYears);

    if (!ageGroupKey || !this.ageGroups[ageGroupKey]) {
      // Fallback to closest age group
      return this._getFallbackAgeGroup(ageInYears);
    }

    return {
      key: ageGroupKey,
      ...this.ageGroups[ageGroupKey]
    };
  }

  /**
   * Get song structure template for a specific category
   * @param {string} category - Song category (lullaby, educational, energizing, etc.)
   * @returns {object} Song structure template with sections, rhyme scheme, etc.
   */
  getSongStructure(category) {
    const normalizedCategory = category.toLowerCase();

    if (!this.songTypes[normalizedCategory]) {
      // Default to lullaby structure
      console.warn(`Unknown song category: ${category}. Defaulting to lullaby.`);
      return this.songTypes.lullaby;
    }

    return this.songTypes[normalizedCategory];
  }

  /**
   * Get music parameters for a specific category and age
   * @param {string} category - Song category
   * @param {number} ageInYears - Child's age (optional, for age-specific refinement)
   * @returns {object} Music parameters (BPM, key, instruments, duration, etc.)
   */
  getMusicParameters(category, ageInYears = null) {
    const normalizedCategory = category.toLowerCase();

    // Get category-specific parameters
    const categoryParams = this.musicParams.byCategory?.[normalizedCategory] || {};

    // Get age-specific parameters if age provided
    let ageParams = {};
    if (ageInYears !== null) {
      const ageGroupKey = this._determineAgeGroup(ageInYears);
      ageParams = this.musicParams.byAge?.[ageGroupKey] || {};
    }

    // Merge parameters (age-specific overrides category defaults)
    return {
      category: normalizedCategory,
      ...categoryParams,
      ...ageParams,
      // Helper computed properties
      tempoName: this._getTempoName(categoryParams.tempoBPM?.optimal || ageParams.optimalTempo || 90),
      durationRange: this._getDurationRange(ageInYears, category)
    };
  }

  /**
   * Get affirmations relevant for age and category/theme
   * @param {number} ageInYears - Child's age
   * @param {string} theme - Affirmation theme (optional: self-esteem, growth-mindset, etc.)
   * @returns {array} Array of relevant affirmations
   */
  getAffirmations(ageInYears, theme = null) {
    const ageGroupKey = this._determineAgeGroup(ageInYears);
    const ageGroup = this.ageGroups[ageGroupKey];

    // Get built-in affirmations from age guidelines
    const builtInAffirmations = ageGroup?.affirmations?.examples || [];

    // Get affirmations from affirmations database
    let dbAffirmations = [];
    if (this.affirmationsDb.byCategory && theme) {
      const categoryData = this.affirmationsDb.byCategory[theme];
      if (categoryData && categoryData.byAge && categoryData.byAge[ageGroupKey]) {
        dbAffirmations = categoryData.byAge[ageGroupKey].examples || [];
      }
    }

    // Combine and return unique affirmations
    const allAffirmations = [...builtInAffirmations, ...dbAffirmations];
    return [...new Set(allAffirmations)]; // Remove duplicates
  }

  /**
   * Get education methodology recommendations for a category
   * @param {string} category - Song category
   * @returns {object} Methodology data (Kodály, Orff, Dalcroze, etc.)
   */
  getMethodology(category) {
    const normalizedCategory = category.toLowerCase();

    // Map categories to methodologies
    const methodologyMap = {
      lullaby: ['kodaly', 'suzuki'],
      educational: ['kodaly', 'orff', 'gordon'],
      energizing: ['orff', 'dalcroze'],
      affirmation: ['music-together', 'kindermusik'],
      story: ['orff', 'suzuki'],
      'social-emotional': ['music-together', 'kindermusik']
    };

    const recommendedMethods = methodologyMap[normalizedCategory] || ['music-together'];

    // Get full methodology data
    const methodologies = {};
    recommendedMethods.forEach(methodKey => {
      if (this.methods.methods && this.methods.methods[methodKey]) {
        methodologies[methodKey] = this.methods.methods[methodKey];
      }
    });

    return {
      recommended: recommendedMethods,
      data: methodologies
    };
  }

  /**
   * Get smart suggestions for frontend UI based on child's age
   * CRITICAL for readymade user inputs
   * @param {number} ageInYears - Child's age
   * @returns {object} Suggestions for topics, categories, affirmations, templates
   */
  getSuggestionsForAge(ageInYears) {
    const ageGroup = this.getAgeGroup(ageInYears);
    const ageGroupKey = ageGroup.key;

    // Get age-appropriate topics with icons
    const topics = (ageGroup.songTopics || []).map(topic => ({
      value: this._slugify(topic),
      label: topic,
      icon: this._getTopicIcon(topic)
    }));

    // Get age-appropriate song categories
    const categories = this._getAgeAppropriateCategories(ageInYears);

    // Get affirmation themes
    const affirmationThemes = this._getAffirmationThemes(ageInYears);

    // Get custom details templates
    const customDetailsTemplates = this._getCustomDetailsTemplates(ageInYears);

    // Get avoid topics (for validation)
    const avoidTopics = ageGroup.avoidTopics || [];

    // Get musical preferences summary
    const musicalPreferences = {
      tempoBPM: `${ageGroup.musicalPreferences.tempoBPM[0]}-${ageGroup.musicalPreferences.tempoBPM[1]} BPM ideal for age ${ageGroup.label}`,
      tempoDescription: ageGroup.musicalPreferences.tempoDescription,
      attentionSpan: ageGroup.development.attentionSpan,
      duration: ageGroup.musicalPreferences.duration,
      preferredInstruments: ageGroup.musicalPreferences.preferredInstruments,
      vocalStyle: ageGroup.musicalPreferences.vocalStyle
    };

    return {
      childAge: ageInYears,
      ageGroup: ageGroupKey,
      ageLabel: ageGroup.label,
      recommendations: {
        topics,
        categories,
        affirmationThemes,
        customDetailsTemplates,
        avoidTopics,
        musicalPreferences
      }
    };
  }

  /**
   * Validate song parameters against age-appropriate guidelines
   * @param {object} songParams - Song parameters to validate
   * @param {number} ageInYears - Child's age
   * @returns {object} Validation result { valid: boolean, warnings: [], errors: [] }
   */
  validateSongParameters(songParams, ageInYears) {
    const ageGroup = this.getAgeGroup(ageInYears);
    const warnings = [];
    const errors = [];

    // Check topic against avoid list
    if (songParams.topic && ageGroup.avoidTopics) {
      const topicLower = songParams.topic.toLowerCase();
      const hasAvoidTopic = ageGroup.avoidTopics.some(avoid =>
        topicLower.includes(avoid.toLowerCase())
      );
      if (hasAvoidTopic) {
        warnings.push(`Topic "${songParams.topic}" may not be age-appropriate for ${ageGroup.label}`);
      }
    }

    // Check duration
    const musicParams = this.getMusicParameters(songParams.category, ageInYears);
    if (songParams.duration && musicParams.durationRange) {
      const [minDuration, maxDuration] = musicParams.durationRange;
      if (songParams.duration < minDuration || songParams.duration > maxDuration) {
        warnings.push(`Duration ${songParams.duration}min outside recommended ${minDuration}-${maxDuration}min for age ${ageGroup.label}`);
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Determine age group key from age in years
   * @private
   */
  _determineAgeGroup(ageInYears) {
    if (ageInYears < 0.5) return '0-6months';
    if (ageInYears < 1) return '6-12months';
    if (ageInYears < 2) return '1-2years';
    if (ageInYears < 3) return '2-3years';
    if (ageInYears < 4) return '3-4years';
    if (ageInYears < 5) return '4-5years';
    if (ageInYears <= 6) return '5-6years';

    // For children older than 6, use 5-6 years as closest
    return '5-6years';
  }

  /**
   * Get fallback age group if age is out of range
   * @private
   */
  _getFallbackAgeGroup(ageInYears) {
    console.warn(`Age ${ageInYears} out of range. Using fallback.`);
    if (ageInYears < 1) {
      return { key: '0-6months', ...this.ageGroups['0-6months'] };
    }
    return { key: '5-6years', ...this.ageGroups['5-6years'] };
  }

  /**
   * Get tempo name from BPM
   * @private
   */
  _getTempoName(bpm) {
    if (bpm < 70) return 'Very Slow (Lullaby)';
    if (bpm < 90) return 'Slow (Calming)';
    if (bpm < 110) return 'Moderate (Learning)';
    if (bpm < 130) return 'Moderately Fast (Active)';
    if (bpm < 150) return 'Fast (Energizing)';
    return 'Very Fast (High Energy)';
  }

  /**
   * Get duration range based on age and category
   * @private
   */
  _getDurationRange(ageInYears, category) {
    if (!ageInYears) return [2, 4]; // Default

    const ageGroup = this.getAgeGroup(ageInYears);
    const durationStr = ageGroup.musicalPreferences?.duration || '2-4 minutes';

    // Parse duration string like "2-3 minutes maximum" or "3-4 minutes"
    const match = durationStr.match(/(\d+)-(\d+)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2])];
    }

    return [2, 4]; // Fallback
  }

  /**
   * Convert topic to slug
   * @private
   */
  _slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  /**
   * Get emoji icon for topic
   * @private
   */
  _getTopicIcon(topic) {
    const iconMap = {
      'sleep': '😴', 'bedtime': '🌙', 'lullaby': '🌙',
      'sharing': '🤝', 'share': '🤝',
      'emotion': '😊', 'feeling': '😊', 'feelings': '😊',
      'count': '🔢', 'number': '🔢', 'counting': '🔢',
      'color': '🎨', 'shape': '🎨',
      'friend': '👫', 'friendship': '👫',
      'animal': '🐶', 'animals': '🐶',
      'body': '👋', 'parts': '👋',
      'nature': '🌳', 'outdoor': '🌳',
      'family': '👨‍👩‍👧', 'parent': '👨‍👩‍👧',
      'bath': '🛁', 'meal': '🍽️', 'food': '🍽️',
      'comfort': '🤗', 'security': '🤗',
      'love': '❤️', 'bonding': '❤️',
      'routine': '⏰', 'daily': '⏰'
    };

    const topicLower = topic.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (topicLower.includes(key)) return icon;
    }

    return '🎵'; // Default music note
  }

  /**
   * Get age-appropriate song categories with descriptions
   * @private
   */
  _getAgeAppropriateCategories(ageInYears) {
    const allCategories = [
      {
        value: 'lullaby',
        label: 'Lullaby',
        description: 'Calm & soothing (60-80 BPM)',
        icon: '😴',
        minAge: 0,
        maxAge: 6
      },
      {
        value: 'educational',
        label: 'Educational',
        description: 'Learning songs (90-120 BPM)',
        icon: '📚',
        minAge: 0.5,
        maxAge: 6
      },
      {
        value: 'affirmation',
        label: 'Confidence Builder',
        description: 'Positive affirmations (80-110 BPM)',
        icon: '⭐',
        minAge: 1,
        maxAge: 6
      },
      {
        value: 'energizing',
        label: 'Active Play',
        description: 'Movement & dance (110-160 BPM)',
        icon: '🎵',
        minAge: 1,
        maxAge: 6
      },
      {
        value: 'story',
        label: 'Story Song',
        description: 'Narrative with lesson (90-120 BPM)',
        icon: '📖',
        minAge: 2,
        maxAge: 6
      },
      {
        value: 'social-emotional',
        label: 'Feelings Song',
        description: 'Understanding emotions (90-110 BPM)',
        icon: '💭',
        minAge: 2,
        maxAge: 6
      }
    ];

    // Filter categories appropriate for age
    return allCategories.filter(cat =>
      ageInYears >= cat.minAge && ageInYears <= cat.maxAge
    ).map(cat => {
      const { minAge, maxAge, ...rest } = cat;
      return rest;
    });
  }

  /**
   * Get affirmation themes for age
   * @private
   */
  _getAffirmationThemes(ageInYears) {
    const themes = [
      {
        value: 'self-esteem',
        label: 'I am special',
        example: 'You are unique and wonderful',
        minAge: 0
      },
      {
        value: 'growth-mindset',
        label: 'I can learn',
        example: 'I can try new things',
        minAge: 1
      },
      {
        value: 'emotional-regulation',
        label: 'I can calm down',
        example: 'I can take deep breaths',
        minAge: 2
      },
      {
        value: 'social-skills',
        label: 'I am a good friend',
        example: 'I share and care',
        minAge: 2
      },
      {
        value: 'body-positivity',
        label: 'My body is strong',
        example: 'I can run and jump',
        minAge: 1
      },
      {
        value: 'independence',
        label: 'I can do it myself',
        example: 'I can try on my own',
        minAge: 2
      }
    ];

    return themes
      .filter(theme => ageInYears >= theme.minAge)
      .map(({ minAge, ...rest }) => rest);
  }

  /**
   * Get custom details templates for guided input
   * @private
   */
  _getCustomDetailsTemplates(ageInYears) {
    const templates = [
      {
        label: 'Favorite animal',
        template: "Include {childName}'s favorite animal: {animal}",
        minAge: 1
      },
      {
        label: 'With sibling',
        template: 'Mention sibling {siblingName}',
        minAge: 1
      },
      {
        label: 'Daily routine',
        template: 'Focus on {routine} routine (morning/bedtime/mealtime)',
        minAge: 0.5
      },
      {
        label: 'Special occasion',
        template: 'For {occasion} (birthday/holiday/first day of school)',
        minAge: 2
      },
      {
        label: 'Learning goal',
        template: 'Help {childName} learn about {concept}',
        minAge: 1
      },
      {
        label: 'Comfort topic',
        template: 'Comfort {childName} about {situation}',
        minAge: 2
      }
    ];

    return templates
      .filter(template => ageInYears >= template.minAge)
      .map(({ minAge, ...rest }) => rest);
  }
}

// Export singleton instance
module.exports = new KnowledgeService();
