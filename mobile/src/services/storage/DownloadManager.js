/**
 * DownloadManager.js
 * Manages download queue with retry logic, progress tracking, and error handling
 */

import FileService from './FileService';
import SongRepository from '../database/SongRepository';
import { generateId } from '../../utils/helpers';

class DownloadManager {
  constructor() {
    this.queue = [];
    this.activeDownloads = new Map();
    this.maxConcurrentDownloads = 3;
    this.maxRetries = 3;
    this.listeners = new Map();
    this.isProcessing = false;
  }

  /**
   * Add download to queue
   * @param {Object} downloadData - Download information
   * @returns {string} Download ID
   */
  async addToQueue(downloadData) {
    const downloadId = generateId('download');

    const download = {
      id: downloadId,
      songId: downloadData.songId,
      audioUrl: downloadData.audioUrl,
      imageUrl: downloadData.imageUrl,
      priority: downloadData.priority || 0,
      retryCount: 0,
      status: 'pending',
      progress: 0,
      error: null,
      createdAt: Date.now()
    };

    this.queue.push(download);
    console.log('[DownloadManager] Added to queue:', downloadId, 'Song:', downloadData.songId);

    // Start processing queue if not already
    if (!this.isProcessing) {
      this.processQueue();
    }

    return downloadId;
  }

  /**
   * Process download queue
   */
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('[DownloadManager] Processing queue...');

    while (this.queue.length > 0 || this.activeDownloads.size > 0) {
      // Start new downloads if under limit
      while (
        this.queue.length > 0 &&
        this.activeDownloads.size < this.maxConcurrentDownloads
      ) {
        // Sort by priority (higher first)
        this.queue.sort((a, b) => b.priority - a.priority);

        const download = this.queue.shift();
        this.startDownload(download);
      }

      // Wait a bit before checking again
      await this.sleep(500);
    }

    this.isProcessing = false;
    console.log('[DownloadManager] Queue processing complete');
  }

  /**
   * Start a download
   * @param {Object} download - Download object
   */
  async startDownload(download) {
    try {
      console.log('[DownloadManager] Starting download:', download.id);

      this.activeDownloads.set(download.id, download);
      download.status = 'downloading';
      this.notifyListeners(download.id, 'status', download);

      // Download audio file
      let audioPath = null;
      if (download.audioUrl) {
        audioPath = await FileService.downloadSongAudio(
          download.songId,
          download.audioUrl,
          (progress) => {
            download.progress = progress * 0.8; // Audio is 80% of total progress
            this.notifyListeners(download.id, 'progress', download);
          }
        );
      }

      // Download image file
      let imagePath = null;
      if (download.imageUrl) {
        imagePath = await FileService.downloadSongImage(
          download.songId,
          download.imageUrl
        );
        download.progress = 1.0; // 100% complete
        this.notifyListeners(download.id, 'progress', download);
      }

      // Get file size
      const fileSize = audioPath ? await FileService.getFileSize(audioPath) : 0;

      // Update song in database
      await SongRepository.markAsDownloaded(
        download.songId,
        audioPath,
        imagePath,
        fileSize
      );

      // Mark download as complete
      download.status = 'completed';
      download.progress = 1.0;
      this.notifyListeners(download.id, 'complete', download);

      console.log('[DownloadManager] ✅ Download complete:', download.id);

      // Remove from active downloads
      this.activeDownloads.delete(download.id);
    } catch (error) {
      console.error('[DownloadManager] ❌ Download failed:', download.id, error);

      download.error = error.message;
      download.retryCount++;

      // Retry if under max retries
      if (download.retryCount < this.maxRetries) {
        console.log(`[DownloadManager] Retrying (${download.retryCount}/${this.maxRetries}):`, download.id);
        download.status = 'retrying';
        this.notifyListeners(download.id, 'retry', download);

        // Add back to queue with slight delay
        await this.sleep(2000 * download.retryCount);
        download.status = 'pending';
        this.queue.push(download);
        this.activeDownloads.delete(download.id);
      } else {
        // Max retries reached
        download.status = 'failed';
        this.notifyListeners(download.id, 'error', download);
        this.activeDownloads.delete(download.id);

        // Update song status to failed
        await SongRepository.updateGenerationStatus(
          download.songId,
          'failed',
          `Download failed: ${error.message}`
        );
      }
    }
  }

  /**
   * Pause a download
   * @param {string} downloadId - Download ID
   */
  pauseDownload(downloadId) {
    const download = this.activeDownloads.get(downloadId) ||
                     this.queue.find(d => d.id === downloadId);

    if (download) {
      download.status = 'paused';
      this.notifyListeners(downloadId, 'paused', download);

      // Remove from queue if present
      const queueIndex = this.queue.findIndex(d => d.id === downloadId);
      if (queueIndex !== -1) {
        this.queue.splice(queueIndex, 1);
      }

      console.log('[DownloadManager] Download paused:', downloadId);
    }
  }

  /**
   * Resume a paused download
   * @param {string} downloadId - Download ID
   */
  resumeDownload(downloadId) {
    const download = this.activeDownloads.get(downloadId);

    if (download && download.status === 'paused') {
      download.status = 'pending';
      this.queue.push(download);
      this.notifyListeners(downloadId, 'resumed', download);

      console.log('[DownloadManager] Download resumed:', downloadId);

      // Start processing if not already
      if (!this.isProcessing) {
        this.processQueue();
      }
    }
  }

  /**
   * Cancel a download
   * @param {string} downloadId - Download ID
   */
  async cancelDownload(downloadId) {
    const download = this.activeDownloads.get(downloadId) ||
                     this.queue.find(d => d.id === downloadId);

    if (download) {
      download.status = 'cancelled';
      this.notifyListeners(downloadId, 'cancelled', download);

      // Remove from queue
      const queueIndex = this.queue.findIndex(d => d.id === downloadId);
      if (queueIndex !== -1) {
        this.queue.splice(queueIndex, 1);
      }

      // Remove from active
      this.activeDownloads.delete(downloadId);

      console.log('[DownloadManager] Download cancelled:', downloadId);
    }
  }

  /**
   * Get download status
   * @param {string} downloadId - Download ID
   * @returns {Object|null} Download object
   */
  getDownloadStatus(downloadId) {
    return this.activeDownloads.get(downloadId) ||
           this.queue.find(d => d.id === downloadId) ||
           null;
  }

  /**
   * Get all active downloads
   * @returns {Array} Array of active downloads
   */
  getActiveDownloads() {
    return Array.from(this.activeDownloads.values());
  }

  /**
   * Get queue
   * @returns {Array} Download queue
   */
  getQueue() {
    return [...this.queue];
  }

  /**
   * Clear completed downloads
   */
  clearCompleted() {
    const completed = [];
    this.activeDownloads.forEach((download, id) => {
      if (download.status === 'completed' || download.status === 'failed') {
        completed.push(id);
      }
    });

    completed.forEach(id => this.activeDownloads.delete(id));
    console.log('[DownloadManager] Cleared', completed.length, 'completed downloads');
  }

  /**
   * Add progress listener
   * @param {string} downloadId - Download ID
   * @param {Function} callback - Callback function (event, download) => {}
   * @returns {string} Listener ID
   */
  addListener(downloadId, callback) {
    const listenerId = generateId('listener');

    if (!this.listeners.has(downloadId)) {
      this.listeners.set(downloadId, new Map());
    }

    this.listeners.get(downloadId).set(listenerId, callback);

    return listenerId;
  }

  /**
   * Remove listener
   * @param {string} downloadId - Download ID
   * @param {string} listenerId - Listener ID
   */
  removeListener(downloadId, listenerId) {
    const downloadListeners = this.listeners.get(downloadId);
    if (downloadListeners) {
      downloadListeners.delete(listenerId);
      if (downloadListeners.size === 0) {
        this.listeners.delete(downloadId);
      }
    }
  }

  /**
   * Notify all listeners
   * @param {string} downloadId - Download ID
   * @param {string} event - Event type
   * @param {Object} download - Download object
   * @private
   */
  notifyListeners(downloadId, event, download) {
    const downloadListeners = this.listeners.get(downloadId);
    if (downloadListeners) {
      downloadListeners.forEach(callback => {
        try {
          callback(event, download);
        } catch (error) {
          console.error('[DownloadManager] Listener error:', error);
        }
      });
    }
  }

  /**
   * Get statistics
   * @returns {Object} Download statistics
   */
  getStats() {
    const active = this.getActiveDownloads();
    const queued = this.queue.length;

    const downloading = active.filter(d => d.status === 'downloading').length;
    const completed = active.filter(d => d.status === 'completed').length;
    const failed = active.filter(d => d.status === 'failed').length;
    const paused = active.filter(d => d.status === 'paused').length;

    return {
      active: active.length,
      queued,
      downloading,
      completed,
      failed,
      paused,
      total: active.length + queued
    };
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set max concurrent downloads
   * @param {number} max - Maximum concurrent downloads
   */
  setMaxConcurrentDownloads(max) {
    this.maxConcurrentDownloads = max;
    console.log('[DownloadManager] Max concurrent downloads set to:', max);
  }

  /**
   * Set max retries
   * @param {number} max - Maximum retries
   */
  setMaxRetries(max) {
    this.maxRetries = max;
    console.log('[DownloadManager] Max retries set to:', max);
  }
}

// Export singleton instance
export default new DownloadManager();
