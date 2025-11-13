const axios = require('axios');
const logger = require('../utils/logger');

class UdioService {
  constructor() {
    this.apiKey = process.env.PIAPI_API_KEY;
    // PiAPI unified API base URL
    this.baseUrl = process.env.PIAPI_BASE_URL || 'https://api.piapi.ai';
    // Demo mode for testing without credits
    this.demoMode = process.env.DEMO_MODE === 'true';
  }

  /**
   * Generate a new song using Udio API via PiAPI
   * @param {string} prompt - Musical style description (e.g., "lullaby, piano, gentle")
   * @param {string|null} lyrics - Custom lyrics (null for AI-generated)
   * @param {string} title - Song title
   * @param {string} style - Music style
   * @returns {Promise<{taskId: string, status: string}>}
   */
  async generateSong(prompt, lyrics = null, title = '', style = 'lullaby') {
    try {
      // DEMO MODE: Return mock task ID instantly
      if (this.demoMode) {
        const mockTaskId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        logger.info('🎭 DEMO MODE: Generating mock song (no API call)', {
          style,
          title,
          mockTaskId
        });
        return {
          taskId: mockTaskId,
          status: 'completed', // Instant completion in demo mode
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Working sample audio
          lyrics: lyrics || 'Demo song lyrics',
          duration: 60
        };
      }

      logger.info('Generating song with Udio API (PiAPI)', {
        style,
        promptLength: prompt.length,
        hasCustomLyrics: !!lyrics
      });

      const requestBody = {
        model: "music-u",
        task_type: "generate_music",
        input: {
          gpt_description_prompt: prompt,
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

      // PiAPI unified task creation endpoint
      const response = await axios.post(
        `${this.baseUrl}/api/v1/task`,
        requestBody,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      logger.info('Song generation initiated (Udio/PiAPI)', {
        taskId: response.data.data?.task_id,
        response: response.data
      });

      return {
        taskId: response.data.data?.task_id,
        status: 'generating'
      };
    } catch (error) {
      logger.error('Udio API Error during generation (PiAPI)', {
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      throw new Error(`Udio API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check the status of a song generation task
   * @param {string} taskId - The task ID returned from generateSong()
   * @returns {Promise<{status: string, audioUrl: string, lyrics: string, duration: number}>}
   */
  async checkStatus(taskId) {
    try {
      // PiAPI unified task status endpoint
      const response = await axios.get(
        `${this.baseUrl}/api/v1/task/${taskId}`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      const data = response.data.data;

      // PiAPI status values: "pending", "processing", "completed", "failed", "staged"
      const status = data.status ? data.status.toLowerCase() : 'pending';

      // Udio returns multiple songs in output.songs array
      const songs = data.output?.songs || [];
      const firstCompletedSong = songs.find(s => s.finished === true);
      const firstSong = firstCompletedSong || songs[0];

      return {
        status: status,
        audioUrl: firstSong?.song_path || null,
        lyrics: firstSong?.lyrics || '',
        duration: firstSong?.duration || 0,
        metadata: {
          allSongs: songs,
          generationId: data.output?.generation_id,
          imageUrl: firstSong?.image_path || null,
          tags: firstSong?.tags || []
        },
        title: firstSong?.title || ''
      };
    } catch (error) {
      logger.error('Udio status check error (PiAPI)', {
        taskId,
        error: error.message
      });
      throw new Error(`Udio Status Check Error: ${error.message}`);
    }
  }

  /**
   * Download audio file from Udio URL
   * @param {string} audioUrl - The audio URL from Udio
   * @returns {Promise<Buffer>}
   */
  async downloadAudio(audioUrl) {
    try {
      logger.info('Downloading audio from Udio', { audioUrl });

      const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 60000 // 60 seconds for large files
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
}

module.exports = new UdioService();
