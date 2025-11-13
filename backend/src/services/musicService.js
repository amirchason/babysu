const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Unified Music Generation Service
 * Supports both Suno AI and Udio AI via PiAPI
 */
class MusicService {
  constructor() {
    this.apiKey = process.env.PIAPI_API_KEY;
    this.baseUrl = process.env.PIAPI_BASE_URL || 'https://api.piapi.ai';
    this.engine = (process.env.MUSIC_ENGINE || 'suno').toLowerCase();
    this.demoMode = process.env.DEMO_MODE === 'true';

    logger.info(`🎵 Music Service initialized`, {
      engine: this.engine,
      demoMode: this.demoMode,
      baseUrl: this.baseUrl
    });
  }

  /**
   * Generate a new song using selected music engine (Suno or Udio)
   * ENHANCED to accept music parameters from knowledge base
   * @param {string} prompt - Musical style description
   * @param {string|null} lyrics - Custom lyrics (null for AI-generated)
   * @param {string} title - Song title
   * @param {string} style - Music style/genre
   * @param {object|null} musicParameters - Music parameters from knowledge base (BPM, key, instruments, etc.)
   * @returns {Promise<{taskId: string, status: string, audioUrl?: string, lyrics?: string}>}
   */
  async generateSong(prompt, lyrics = null, title = '', style = 'lullaby', musicParameters = null) {
    try {
      // DEMO MODE: Return mock data
      if (this.demoMode) {
        const mockTaskId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        logger.info('🎭 DEMO MODE: Generating mock song (no API call)', {
          style,
          title,
          mockTaskId,
          engine: 'demo',
          musicParameters: musicParameters ? {
            bpm: musicParameters.bpm,
            key: musicParameters.key,
            ageGroup: musicParameters.ageGroup
          } : null
        });
        return {
          taskId: mockTaskId,
          status: 'completed',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          lyrics: lyrics || 'Demo song lyrics',
          duration: 60
        };
      }

      // Route to appropriate engine
      if (this.engine === 'suno') {
        return await this.generateWithSuno(prompt, lyrics, title, style, musicParameters);
      } else {
        return await this.generateWithUdio(prompt, lyrics, title, style, musicParameters);
      }
    } catch (error) {
      logger.error('Music generation error', {
        engine: this.engine,
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      throw new Error(`Music API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generate song with Suno AI (chirp-v3-5 model)
   * ENHANCED to use music parameters from knowledge base
   * Price: $0.02 per song
   * Endpoint: POST /api/suno/v1/music
   */
  async generateWithSuno(prompt, lyrics, title, style, musicParameters = null) {
    // Build enhanced tags with music parameters
    let tags = style || 'lullaby, soft, gentle, piano, soothing';

    if (musicParameters) {
      // Enhance tags with BPM, key, instruments from knowledge base
      const { bpm, key, instruments, dynamics, vocalStyle } = musicParameters;
      const instrumentTags = instruments?.join(', ') || '';
      tags = `${style || 'lullaby'}, ${bpm} BPM, ${key}, ${instrumentTags}, ${dynamics}, ${vocalStyle}`;
    }

    logger.info('🎵 Generating song with Suno AI (PiAPI)', {
      style,
      title,
      promptLength: prompt.length,
      hasCustomLyrics: !!lyrics,
      musicParameters: musicParameters ? {
        bpm: musicParameters.bpm,
        key: musicParameters.key,
        ageGroup: musicParameters.ageGroup
      } : null,
      enhancedTags: tags
    });

    const requestBody = {
      custom_mode: true,
      mv: "chirp-v3-5",  // Suno v3.5 model
      input: {
        prompt: lyrics || prompt,  // For Suno, prompt is the lyrics/description
        title: title || 'Lullaby',
        tags: tags // Enhanced with knowledge base parameters
      }
    };

    logger.debug('Suno API Request', { requestBody });

    const response = await axios.post(
      `${this.baseUrl}/api/suno/v1/music`,
      requestBody,
      {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    logger.info('🎶 Suno song generation initiated', {
      taskId: response.data.data?.task_id,
      code: response.data.code,
      message: response.data.message
    });

    return {
      taskId: response.data.data?.task_id,
      status: 'generating',
      engine: 'suno'
    };
  }

  /**
   * Generate song with Udio AI (music-u model)
   * ENHANCED to use music parameters from knowledge base
   * Price: $0.05 per song
   * Endpoint: POST /api/v1/task
   */
  async generateWithUdio(prompt, lyrics, title, style, musicParameters = null) {
    // Enhance prompt with music parameters
    let enhancedPrompt = prompt;

    if (musicParameters) {
      const { bpm, key, instruments, dynamics, vocalStyle } = musicParameters;
      const instrumentList = instruments?.join(', ') || '';
      enhancedPrompt = `${prompt}. Musical characteristics: ${bpm} BPM, ${key}, instruments: ${instrumentList}, ${dynamics} dynamics, ${vocalStyle} vocals`;
    }

    logger.info('🎵 Generating song with Udio AI (PiAPI)', {
      style,
      promptLength: enhancedPrompt.length,
      hasCustomLyrics: !!lyrics,
      musicParameters: musicParameters ? {
        bpm: musicParameters.bpm,
        key: musicParameters.key,
        ageGroup: musicParameters.ageGroup
      } : null
    });

    const requestBody = {
      model: "music-u",
      task_type: "generate_music",
      input: {
        gpt_description_prompt: enhancedPrompt, // Enhanced with knowledge base
        lyrics_type: lyrics ? "user" : "generate",
        negative_tags: "",
        seed: -1
      },
      config: {
        service_mode: "public"
      }
    };

    if (lyrics) {
      requestBody.input.lyrics = lyrics;
    }

    if (title) {
      requestBody.input.title = title;
    }

    logger.debug('Udio API Request', { requestBody });

    const response = await axios.post(
      `${this.baseUrl}/api/v1/task`,
      requestBody,
      {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    logger.info('🎶 Udio song generation initiated', {
      taskId: response.data.data?.task_id,
      code: response.data.code,
      message: response.data.message
    });

    return {
      taskId: response.data.data?.task_id,
      status: 'generating',
      engine: 'udio'
    };
  }

  /**
   * Check the status of a song generation task
   * Supports both Suno and Udio response formats
   * @param {string} taskId - The task ID returned from generateSong()
   * @returns {Promise<{status: string, audioUrl: string, lyrics: string, duration: number}>}
   */
  async checkStatus(taskId) {
    try {
      // Determine engine from taskId prefix or use current engine
      const isDemoTask = taskId.startsWith('demo-');

      if (isDemoTask) {
        logger.info('🎭 DEMO MODE: Returning mock completed status');
        return {
          status: 'completed',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          lyrics: 'Demo song lyrics',
          duration: 60
        };
      }

      // Both Suno and Udio use the same unified task status endpoint
      const endpoint = `/api/v1/task/${taskId}`;

      const response = await axios.get(
        `${this.baseUrl}${endpoint}`,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      const data = response.data.data;

      // Parse status (unified across both APIs)
      const status = data.status ? data.status.toLowerCase() : 'pending';

      // Parse output based on engine
      if (this.engine === 'suno') {
        return this.parseSunoOutput(data, status);
      } else {
        return this.parseUdioOutput(data, status);
      }
    } catch (error) {
      logger.error('Status check error', {
        taskId,
        engine: this.engine,
        error: error.message
      });
      throw new Error(`Status Check Error: ${error.message}`);
    }
  }

  /**
   * Parse Suno AI response output
   */
  parseSunoOutput(data, status) {
    // Suno returns clips array
    const clips = data.output?.clips || [];
    const firstClip = clips[0];

    if (!firstClip && status === 'completed') {
      logger.warn('Suno completed but no clips found', { data });
    }

    return {
      status: status,
      audioUrl: firstClip?.audio_url || null,
      lyrics: firstClip?.metadata?.prompt || '',
      duration: firstClip?.metadata?.duration || 0,
      metadata: {
        allClips: clips,
        imageUrl: firstClip?.image_url || null,
        tags: firstClip?.metadata?.tags || '',
        engine: 'suno'
      },
      title: firstClip?.title || ''
    };
  }

  /**
   * Parse Udio AI response output
   */
  parseUdioOutput(data, status) {
    // Udio returns songs array
    const songs = data.output?.songs || [];
    const firstCompletedSong = songs.find(s => s.finished === true);
    const firstSong = firstCompletedSong || songs[0];

    if (!firstSong && status === 'completed') {
      logger.warn('Udio completed but no songs found', { data });
    }

    return {
      status: status,
      audioUrl: firstSong?.song_path || null,
      lyrics: firstSong?.lyrics || '',
      duration: firstSong?.duration || 0,
      metadata: {
        allSongs: songs,
        generationId: data.output?.generation_id,
        imageUrl: firstSong?.image_path || null,
        tags: firstSong?.tags || [],
        engine: 'udio'
      },
      title: firstSong?.title || ''
    };
  }

  /**
   * Download audio file from URL
   * @param {string} audioUrl - The audio URL from music API
   * @returns {Promise<Buffer>}
   */
  async downloadAudio(audioUrl) {
    try {
      logger.info('Downloading audio', { audioUrl, engine: this.engine });

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
      engine: this.engine,
      pricing: this.engine === 'suno' ? '$0.02/song' : '$0.05/song',
      model: this.engine === 'suno' ? 'chirp-v3-5' : 'music-u',
      provider: 'PiAPI',
      demoMode: this.demoMode
    };
  }
}

module.exports = new MusicService();
