/**
 * SongGenerationService.js
 * Handles song generation workflow with PiAPI backend
 */

import ApiService from './ApiService';
import SongRepository from '../database/SongRepository';
import DownloadManager from '../storage/DownloadManager';
import { generateId } from '../../utils/helpers';

class SongGenerationService {
  constructor() {
    this.pollingIntervals = new Map();
    this.maxPollAttempts = 60; // 60 attempts * 5 seconds = 5 minutes max
    this.pollInterval = 5000; // 5 seconds
  }

  /**
   * Generate a new song
   * @param {Object} songData - Song generation parameters
   * @returns {Promise<Object>} Created song
   */
  async generateSong(songData) {
    try {
      console.log('[SongGeneration] Generating song:', songData.title);

      // Create song in database first
      const songId = generateId('song');
      const song = await SongRepository.create({
        id: songId,
        title: songData.title,
        child_ids: songData.child_ids,
        topic: songData.topic,
        category: songData.category || 'general',
        style: songData.style,
        generation_status: 'pending'
      });

      // Call API to start generation
      const apiResponse = await ApiService.post('/songs/generate', {
        title: songData.title,
        prompt: this.buildPrompt(songData),
        style: songData.style || 'gentle',
        duration: songData.duration || 120
      });

      // Update song with task_id
      const updatedSong = await SongRepository.update(songId, {
        task_id: apiResponse.task_id || apiResponse.taskId,
        generation_status: 'processing'
      });

      // Start polling for status
      this.startPolling(updatedSong);

      console.log('[SongGeneration] ✅ Generation started:', songId, 'Task:', updatedSong.task_id);

      return updatedSong;
    } catch (error) {
      console.error('[SongGeneration] ❌ Generation failed:', error);
      throw error;
    }
  }

  /**
   * Build prompt from song data
   * @param {Object} songData - Song data
   * @returns {string} Generated prompt
   * @private
   */
  buildPrompt(songData) {
    const parts = [];

    if (songData.category) {
      parts.push(`A ${songData.category} song`);
    }

    if (songData.topic) {
      parts.push(`about ${songData.topic}`);
    }

    if (songData.childName) {
      parts.push(`for ${songData.childName}`);
    }

    if (songData.age) {
      parts.push(`(age ${songData.age})`);
    }

    if (songData.interests && songData.interests.length > 0) {
      parts.push(`incorporating themes of ${songData.interests.join(', ')}`);
    }

    if (songData.style) {
      parts.push(`in a ${songData.style} style`);
    }

    const prompt = parts.join(' ');
    console.log('[SongGeneration] Prompt:', prompt);

    return prompt || 'Create a gentle, soothing children\'s song';
  }

  /**
   * Start polling for song generation status
   * @param {Object} song - Song object with task_id
   */
  startPolling(song) {
    if (!song.task_id) {
      console.error('[SongGeneration] Cannot poll without task_id');
      return;
    }

    console.log('[SongGeneration] Starting polling for:', song.id, 'Task:', song.task_id);

    let attempts = 0;

    const intervalId = setInterval(async () => {
      try {
        attempts++;

        if (attempts > this.maxPollAttempts) {
          console.error('[SongGeneration] Max poll attempts reached for:', song.id);
          this.stopPolling(song.id);

          await SongRepository.updateGenerationStatus(
            song.id,
            'failed',
            'Generation timeout - exceeded maximum wait time'
          );
          return;
        }

        // Check status
        const status = await this.checkStatus(song.task_id);

        if (status.status === 'completed') {
          console.log('[SongGeneration] ✅ Generation complete:', song.id);
          this.stopPolling(song.id);

          // Update song with URLs
          await SongRepository.update(song.id, {
            audio_remote_url: status.audio_url,
            image_url: status.image_url,
            lyrics: status.lyrics || '',
            duration: status.duration || null,
            generation_status: 'completed'
          });

          // Auto-download if enabled
          await this.autoDownload(song.id, status.audio_url, status.image_url);
        } else if (status.status === 'failed') {
          console.error('[SongGeneration] ❌ Generation failed:', song.id);
          this.stopPolling(song.id);

          await SongRepository.updateGenerationStatus(
            song.id,
            'failed',
            status.error || 'Generation failed'
          );
        } else {
          console.log(`[SongGeneration] Still processing (${attempts}/${this.maxPollAttempts}):`, song.id);
        }
      } catch (error) {
        console.error('[SongGeneration] Polling error:', error);

        // Continue polling on error (might be temporary network issue)
        if (attempts > this.maxPollAttempts) {
          this.stopPolling(song.id);
          await SongRepository.updateGenerationStatus(
            song.id,
            'failed',
            error.message
          );
        }
      }
    }, this.pollInterval);

    this.pollingIntervals.set(song.id, intervalId);
  }

  /**
   * Stop polling for a song
   * @param {string} songId - Song ID
   */
  stopPolling(songId) {
    const intervalId = this.pollingIntervals.get(songId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(songId);
      console.log('[SongGeneration] Stopped polling for:', songId);
    }
  }

  /**
   * Check song generation status
   * @param {string} taskId - Task ID from API
   * @returns {Promise<Object>} Status response
   */
  async checkStatus(taskId) {
    try {
      const response = await ApiService.get(`/songs/status/${taskId}`);
      return response;
    } catch (error) {
      console.error('[SongGeneration] Status check failed:', error);
      throw error;
    }
  }

  /**
   * Auto-download song if enabled
   * @param {string} songId - Song ID
   * @param {string} audioUrl - Audio URL
   * @param {string} imageUrl - Image URL
   * @private
   */
  async autoDownload(songId, audioUrl, imageUrl) {
    try {
      // Check if auto-download is enabled (would come from Redux state in real app)
      const autoDownloadEnabled = true; // TODO: Get from Redux settings

      if (autoDownloadEnabled && audioUrl) {
        console.log('[SongGeneration] Auto-downloading:', songId);

        await DownloadManager.addToQueue({
          songId,
          audioUrl,
          imageUrl,
          priority: 1
        });
      }
    } catch (error) {
      console.error('[SongGeneration] Auto-download failed:', error);
      // Don't throw - song generation was successful
    }
  }

  /**
   * Retry failed generation
   * @param {string} songId - Song ID
   * @returns {Promise<Object>} Updated song
   */
  async retryGeneration(songId) {
    try {
      console.log('[SongGeneration] Retrying generation:', songId);

      const song = await SongRepository.findById(songId);
      if (!song) {
        throw new Error('Song not found');
      }

      // Reset status
      await SongRepository.update(songId, {
        generation_status: 'pending',
        generation_error: null,
        task_id: null
      });

      // Start new generation
      return await this.generateSong({
        title: song.title,
        child_ids: song.child_ids,
        topic: song.topic,
        category: song.category,
        style: song.style
      });
    } catch (error) {
      console.error('[SongGeneration] Retry failed:', error);
      throw error;
    }
  }

  /**
   * Cancel ongoing generation
   * @param {string} songId - Song ID
   */
  async cancelGeneration(songId) {
    try {
      console.log('[SongGeneration] Cancelling generation:', songId);

      this.stopPolling(songId);

      await SongRepository.updateGenerationStatus(
        songId,
        'failed',
        'Cancelled by user'
      );
    } catch (error) {
      console.error('[SongGeneration] Cancel failed:', error);
      throw error;
    }
  }

  /**
   * Get all active generations
   * @returns {Array} Songs being generated
   */
  async getActiveGenerations() {
    try {
      const songs = await SongRepository.findByStatus('processing');
      return songs;
    } catch (error) {
      console.error('[SongGeneration] Get active generations failed:', error);
      throw error;
    }
  }

  /**
   * Resume polling for all processing songs
   * (useful when app restarts)
   */
  async resumeAllPolling() {
    try {
      console.log('[SongGeneration] Resuming all polling...');

      const processingSongs = await SongRepository.findByStatus('processing');

      for (const song of processingSongs) {
        if (song.task_id) {
          this.startPolling(song);
        }
      }

      console.log('[SongGeneration] Resumed polling for', processingSongs.length, 'songs');
    } catch (error) {
      console.error('[SongGeneration] Resume polling failed:', error);
      throw error;
    }
  }

  /**
   * Stop all polling
   */
  stopAllPolling() {
    console.log('[SongGeneration] Stopping all polling...');

    this.pollingIntervals.forEach((intervalId, songId) => {
      clearInterval(intervalId);
    });

    this.pollingIntervals.clear();
    console.log('[SongGeneration] All polling stopped');
  }
}

// Export singleton instance
export default new SongGenerationService();
