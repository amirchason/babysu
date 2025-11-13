const axios = require('axios');
const logger = require('../utils/logger');

/**
 * SunoAPI.org Music Generation Service
 * Official Suno AI API integration via sunoapi.org
 */
class SunoMusicService {
  constructor() {
    this.apiKey = process.env.SUNO_API_KEY;
    this.baseUrl = process.env.SUNO_BASE_URL || 'https://api.sunoapi.org';
    this.callbackUrl = process.env.SUNO_CALLBACK_URL || 'https://webhook.site/suno-callback';
    this.demoMode = process.env.DEMO_MODE === 'true';
    this.defaultModel = process.env.SUNO_MODEL || 'V3_5';

    if (!this.apiKey && !this.demoMode) {
      logger.warn('⚠️  SUNO_API_KEY not found in environment variables');
    }

    logger.info(`🎵 Suno Music Service initialized`, {
      engine: 'sunoapi.org',
      model: this.defaultModel,
      demoMode: this.demoMode,
      baseUrl: this.baseUrl
    });
  }

  /**
   * Generate a new song using Suno AI
   * @param {string} prompt - Musical style description
   * @param {string|null} lyrics - Custom lyrics (if null, AI generates)
   * @param {string} title - Song title
   * @param {string} style - Music style/genre
   * @returns {Promise<{taskId: string, status: string, engine: string}>}
   */
  async generateSong(prompt, lyrics = null, title = 'Untitled', style = 'lullaby') {
    try {
      // DEMO MODE: Return mock data
      if (this.demoMode) {
        const mockTaskId = `suno-demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        logger.info('🎭 DEMO MODE: Generating mock song (no API call)', {
          style,
          title,
          mockTaskId
        });
        return {
          taskId: mockTaskId,
          status: 'PENDING',
          engine: 'suno-demo'
        };
      }

      logger.info('🎵 Generating song with Suno AI', {
        style,
        title,
        promptLength: prompt?.length || 0,
        hasCustomLyrics: !!lyrics,
        model: this.defaultModel
      });

      // Prepare full prompt with lyrics if provided
      const fullPrompt = lyrics ? `${prompt}\n\nLyrics:\n${lyrics}` : prompt;

      const requestBody = {
        prompt: fullPrompt,
        model: this.defaultModel,
        customMode: true,
        instrumental: false,  // We want vocals for lullabies
        style: style || 'lullaby',
        title: title || 'Untitled Song',
        callBackUrl: this.callbackUrl
      };

      logger.debug('Suno API Request', { requestBody });

      const response = await axios.post(
        `${this.baseUrl}/api/v1/generate`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Song generation failed');
      }

      logger.info('🎶 Suno song generation initiated', {
        taskId: response.data.data?.taskId,
        model: this.defaultModel
      });

      return {
        taskId: response.data.data?.taskId,
        status: 'PENDING',
        engine: 'suno'
      };

    } catch (error) {
      logger.error('Suno generation error', {
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      throw new Error(`Suno API Error: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * Check the status of a song generation task
   * @param {string} taskId - The task ID returned from generateSong()
   * @returns {Promise<{status: string, audioUrl: string, lyrics: string, duration: number, metadata: object}>}
   */
  async checkStatus(taskId) {
    try {
      const isDemoTask = taskId.startsWith('suno-demo-');

      if (isDemoTask) {
        logger.info('🎭 DEMO MODE: Returning mock completed status');
        return {
          status: 'SUCCESS',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          lyrics: 'Demo song lyrics for testing',
          duration: 60,
          title: 'Demo Song',
          tags: 'demo, test',
          metadata: {
            engine: 'suno-demo'
          }
        };
      }

      const response = await axios.get(
        `${this.baseUrl}/api/v1/generate/record-info`,
        {
          params: { taskId },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Status check failed');
      }

      const data = response.data.data;
      const status = data.status; // PENDING, GENERATING, SUCCESS, FAILED

      // Parse the response based on status
      if (status === 'SUCCESS' && data.response) {
        const songData = this.parseSunoResponse(data.response);
        return {
          status: 'SUCCESS',
          ...songData,
          metadata: {
            engine: 'suno',
            taskId: taskId,
            type: data.type
          }
        };
      }

      // Still processing
      return {
        status: status,
        progress: status === 'GENERATING' ? 'processing' : 'pending',
        metadata: {
          engine: 'suno',
          taskId: taskId
        }
      };

    } catch (error) {
      logger.error('Suno status check error', {
        taskId,
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Status Check Error: ${error.message}`);
    }
  }

  /**
   * Parse Suno API response to extract song data
   * @param {object} response - The response object from Suno API
   * @returns {object} Parsed song data
   */
  parseSunoResponse(response) {
    // Response can be a JSON string or object
    let responseData;
    if (typeof response === 'string') {
      try {
        responseData = JSON.parse(response);
      } catch (e) {
        logger.error('Failed to parse Suno response', { response });
        throw new Error('Invalid response format from Suno API');
      }
    } else {
      responseData = response;
    }

    // Extract the first song from the data array
    // API returns "sunoData" field (not "data")
    const songs = responseData.sunoData || responseData.data || [];
    const firstSong = songs[0];

    if (!firstSong) {
      logger.warn('No song data found in Suno response', { responseData });
      throw new Error('No song data in response');
    }

    return {
      audioUrl: firstSong.audio_url || firstSong.audioUrl || null,
      lyrics: firstSong.lyrics || firstSong.lyric || '',
      duration: firstSong.duration || 0,
      title: firstSong.title || 'Untitled',
      tags: firstSong.tags || '',
      imageUrl: firstSong.image_url || firstSong.imageUrl || null,
      allSongs: songs  // Include all generated variations
    };
  }

  /**
   * Download audio file from URL
   * @param {string} audioUrl - The audio URL from Suno API
   * @returns {Promise<Buffer>}
   */
  async downloadAudio(audioUrl) {
    try {
      logger.info('Downloading audio', { audioUrl, engine: 'suno' });

      const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 60000
      });

      return Buffer.from(response.data);
    } catch (error) {
      logger.error('Audio download error', {
        audioUrl,
        error: error.message
      });
      throw new Error(`Audio Download Error: ${error.message}`);
    }
  }

  /**
   * Get current engine info
   */
  getEngineInfo() {
    return {
      engine: 'suno',
      provider: 'sunoapi.org',
      model: this.defaultModel,
      pricing: '$0.02-0.05 per song (varies by model)',
      demoMode: this.demoMode
    };
  }
}

module.exports = new SunoMusicService();
