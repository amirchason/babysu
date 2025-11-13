/**
 * CacheManager.js
 * Manages cache and storage cleanup for BabySu mobile app
 * Handles automatic cache cleanup based on size limits
 */

import FileService from './FileService';
import SongRepository from '../database/SongRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheManager {
  constructor() {
    this.maxCacheSizeMB = 500; // Default 500MB
    this.cacheCheckInterval = 1000 * 60 * 60; // Check every hour
    this.isMonitoring = false;
  }

  /**
   * Initialize cache manager
   * @param {number} maxSizeMB - Maximum cache size in MB (default: 500)
   */
  async initialize(maxSizeMB = 500) {
    try {
      console.log('[CacheManager] Initializing...');

      // Load max cache size from settings
      const savedMaxSize = await AsyncStorage.getItem('max_cache_size_mb');
      this.maxCacheSizeMB = savedMaxSize ? parseInt(savedMaxSize) : maxSizeMB;

      console.log('[CacheManager] ✅ Initialized with max size:', this.maxCacheSizeMB, 'MB');

      // Start monitoring
      this.startMonitoring();
    } catch (error) {
      console.error('[CacheManager] ❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start cache monitoring
   * Automatically checks and cleans cache at intervals
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('[CacheManager] Started monitoring');

    this.monitorInterval = setInterval(async () => {
      try {
        await this.checkAndCleanCache();
      } catch (error) {
        console.error('[CacheManager] Monitor check failed:', error);
      }
    }, this.cacheCheckInterval);

    // Run initial check
    this.checkAndCleanCache();
  }

  /**
   * Stop cache monitoring
   */
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.isMonitoring = false;
      console.log('[CacheManager] Stopped monitoring');
    }
  }

  /**
   * Check cache size and clean if necessary
   * @returns {Promise<Object>} Cleanup results
   */
  async checkAndCleanCache() {
    try {
      console.log('[CacheManager] Checking cache size...');

      const stats = await FileService.getStorageStats();
      const totalSizeMB = parseFloat(stats.totalMB);

      console.log('[CacheManager] Current storage:', totalSizeMB, 'MB');
      console.log('[CacheManager] Max allowed:', this.maxCacheSizeMB, 'MB');

      if (totalSizeMB > this.maxCacheSizeMB) {
        console.log('[CacheManager] ⚠️ Storage limit exceeded, cleaning...');

        const result = await this.cleanOldestSongs(totalSizeMB - this.maxCacheSizeMB);

        console.log('[CacheManager] ✅ Cleanup complete');
        return result;
      } else {
        console.log('[CacheManager] Storage within limits');
        return { cleaned: false, reason: 'within_limits' };
      }
    } catch (error) {
      console.error('[CacheManager] ❌ Check and clean failed:', error);
      throw error;
    }
  }

  /**
   * Clean oldest songs to free up space
   * @param {number} targetMB - Target size to free in MB
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanOldestSongs(targetMB) {
    try {
      console.log('[CacheManager] Cleaning oldest songs, target:', targetMB, 'MB');

      // Get all downloaded songs sorted by last played (oldest first)
      const songs = await SongRepository.findAll({
        sortBy: 'last_played_at',
        order: 'ASC'
      });

      const downloadedSongs = songs.filter(s => s.is_downloaded);

      let freedMB = 0;
      const deletedSongs = [];

      for (const song of downloadedSongs) {
        if (freedMB >= targetMB) break;

        // Don't delete favorites
        if (song.is_favorite) continue;

        try {
          // Delete song files
          await FileService.deleteSongFiles(
            song.audio_local_path,
            song.image_local_path
          );

          // Update database
          await SongRepository.update(song.id, {
            is_downloaded: false,
            audio_local_path: null,
            image_local_path: null
          });

          const fileSizeMB = (song.file_size || 0) / 1024 / 1024;
          freedMB += fileSizeMB;
          deletedSongs.push(song.id);

          console.log('[CacheManager] Deleted:', song.title, '(', fileSizeMB.toFixed(2), 'MB)');
        } catch (error) {
          console.error('[CacheManager] Failed to delete song:', song.id, error);
        }
      }

      console.log('[CacheManager] Freed', freedMB.toFixed(2), 'MB by deleting', deletedSongs.length, 'songs');

      return {
        cleaned: true,
        freedMB: freedMB.toFixed(2),
        deletedCount: deletedSongs.length,
        deletedSongs
      };
    } catch (error) {
      console.error('[CacheManager] ❌ Clean oldest songs failed:', error);
      throw error;
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} True if cleared
   */
  async clearAllCache() {
    try {
      console.log('[CacheManager] ⚠️ Clearing all cache...');

      // Clear file system cache
      await FileService.clearCache();

      // Clear AsyncStorage cache keys (if any)
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }

      console.log('[CacheManager] ✅ All cache cleared');
      return true;
    } catch (error) {
      console.error('[CacheManager] ❌ Clear all cache failed:', error);
      throw error;
    }
  }

  /**
   * Delete all downloaded songs
   * WARNING: This will delete ALL downloaded songs (except favorites if specified)
   * @param {boolean} keepFavorites - Keep favorite songs (default: true)
   * @returns {Promise<Object>} Deletion results
   */
  async deleteAllDownloaded(keepFavorites = true) {
    try {
      console.log('[CacheManager] ⚠️ Deleting all downloaded songs...');

      const songs = await SongRepository.findDownloaded();
      let deletedCount = 0;
      let skippedCount = 0;
      let freedMB = 0;

      for (const song of songs) {
        if (keepFavorites && song.is_favorite) {
          skippedCount++;
          continue;
        }

        try {
          await FileService.deleteSongFiles(
            song.audio_local_path,
            song.image_local_path
          );

          await SongRepository.update(song.id, {
            is_downloaded: false,
            audio_local_path: null,
            image_local_path: null
          });

          const fileSizeMB = (song.file_size || 0) / 1024 / 1024;
          freedMB += fileSizeMB;
          deletedCount++;
        } catch (error) {
          console.error('[CacheManager] Failed to delete song:', song.id, error);
        }
      }

      console.log('[CacheManager] ✅ Deleted', deletedCount, 'songs, freed', freedMB.toFixed(2), 'MB');
      console.log('[CacheManager] Skipped', skippedCount, 'favorites');

      return {
        deleted: deletedCount,
        skipped: skippedCount,
        freedMB: freedMB.toFixed(2)
      };
    } catch (error) {
      console.error('[CacheManager] ❌ Delete all downloaded failed:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getStats() {
    try {
      const storageStats = await FileService.getStorageStats();
      const songStats = await SongRepository.getStats();

      const totalSizeMB = parseFloat(storageStats.totalMB);
      const percentUsed = (totalSizeMB / this.maxCacheSizeMB) * 100;

      return {
        ...storageStats,
        maxSizeMB: this.maxCacheSizeMB,
        percentUsed: percentUsed.toFixed(1),
        isOverLimit: totalSizeMB > this.maxCacheSizeMB,
        downloadedSongs: songStats.downloaded,
        totalSongs: songStats.total,
        monitoring: this.isMonitoring
      };
    } catch (error) {
      console.error('[CacheManager] ❌ Get stats failed:', error);
      throw error;
    }
  }

  /**
   * Set maximum cache size
   * @param {number} sizeMB - Size in MB
   */
  async setMaxCacheSize(sizeMB) {
    try {
      this.maxCacheSizeMB = sizeMB;
      await AsyncStorage.setItem('max_cache_size_mb', sizeMB.toString());
      console.log('[CacheManager] Max cache size set to:', sizeMB, 'MB');

      // Check if we need to clean now
      await this.checkAndCleanCache();
    } catch (error) {
      console.error('[CacheManager] ❌ Set max cache size failed:', error);
      throw error;
    }
  }

  /**
   * Get storage recommendations
   * @returns {Promise<Object>} Recommendations
   */
  async getRecommendations() {
    try {
      const stats = await this.getStats();
      const recommendations = [];

      if (stats.isOverLimit) {
        recommendations.push({
          type: 'warning',
          message: `Storage is ${stats.percentUsed}% full (${stats.totalMB} MB / ${stats.maxSizeMB} MB)`,
          action: 'clean_oldest',
          priority: 'high'
        });
      }

      if (parseFloat(stats.cacheMB) > 50) {
        recommendations.push({
          type: 'info',
          message: `Cache folder using ${stats.cacheMB} MB`,
          action: 'clear_cache',
          priority: 'medium'
        });
      }

      const downloadedNotPlayed = await SongRepository.findAll({
        sortBy: 'last_played_at',
        order: 'ASC'
      });

      const unplayedDownloaded = downloadedNotPlayed.filter(
        s => s.is_downloaded && !s.last_played_at
      );

      if (unplayedDownloaded.length > 10) {
        recommendations.push({
          type: 'info',
          message: `${unplayedDownloaded.length} downloaded songs haven't been played`,
          action: 'review_downloads',
          priority: 'low'
        });
      }

      return {
        stats,
        recommendations,
        needsAction: recommendations.some(r => r.priority === 'high')
      };
    } catch (error) {
      console.error('[CacheManager] ❌ Get recommendations failed:', error);
      throw error;
    }
  }

  /**
   * Optimize storage
   * Automatically clean based on recommendations
   * @returns {Promise<Object>} Optimization results
   */
  async optimize() {
    try {
      console.log('[CacheManager] Optimizing storage...');

      const results = {
        cacheCleared: false,
        songsDeleted: 0,
        freedMB: 0
      };

      // Clear cache
      await this.clearAllCache();
      results.cacheCleared = true;

      // Check if we need to clean songs
      const stats = await FileService.getStorageStats();
      const totalSizeMB = parseFloat(stats.totalMB);

      if (totalSizeMB > this.maxCacheSizeMB) {
        const cleanResult = await this.cleanOldestSongs(totalSizeMB - this.maxCacheSizeMB);
        results.songsDeleted = cleanResult.deletedCount;
        results.freedMB = parseFloat(cleanResult.freedMB);
      }

      console.log('[CacheManager] ✅ Optimization complete');
      return results;
    } catch (error) {
      console.error('[CacheManager] ❌ Optimize failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new CacheManager();
