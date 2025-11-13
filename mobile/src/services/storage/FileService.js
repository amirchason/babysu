/**
 * FileService.js
 * Core file system service for BabySu mobile app
 * Handles file operations, directory management, and storage
 */

import * as FileSystem from 'expo-file-system';

class FileService {
  constructor() {
    this.baseDir = FileSystem.documentDirectory;
    this.songsDir = `${this.baseDir}songs/`;
    this.audioDir = `${this.songsDir}audio/`;
    this.imagesDir = `${this.songsDir}images/`;
    this.childrenDir = `${this.baseDir}children/`;
    this.avatarsDir = `${this.childrenDir}avatars/`;
    this.cacheDir = `${this.baseDir}cache/`;
    this.isInitialized = false;
  }

  /**
   * Initialize file system directories
   * Creates all necessary directories for the app
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[FileService] Already initialized');
      return;
    }

    try {
      console.log('[FileService] Initializing file system...');
      console.log('[FileService] Base directory:', this.baseDir);

      // Create all directories
      await this.ensureDirectoryExists(this.songsDir);
      await this.ensureDirectoryExists(this.audioDir);
      await this.ensureDirectoryExists(this.imagesDir);
      await this.ensureDirectoryExists(this.childrenDir);
      await this.ensureDirectoryExists(this.avatarsDir);
      await this.ensureDirectoryExists(this.cacheDir);

      this.isInitialized = true;
      console.log('[FileService] ✅ File system initialized successfully');

      // Log directory info
      await this.logStorageInfo();
    } catch (error) {
      console.error('[FileService] ❌ Initialization failed:', error);
      throw new Error(`File system initialization failed: ${error.message}`);
    }
  }

  /**
   * Ensure a directory exists, create if it doesn't
   * @param {string} dirPath - Directory path
   */
  async ensureDirectoryExists(dirPath) {
    try {
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        console.log('[FileService] Creating directory:', dirPath);
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }
    } catch (error) {
      console.error('[FileService] Error creating directory:', dirPath, error);
      throw error;
    }
  }

  /**
   * Download a file from URL
   * @param {string} url - Remote URL
   * @param {string} localPath - Local file path
   * @param {Function} onProgress - Progress callback (progress) => {}
   * @returns {Promise<string>} Local file path
   */
  async downloadFile(url, localPath, onProgress = null) {
    try {
      console.log('[FileService] Downloading file:', url);
      console.log('[FileService] Destination:', localPath);

      // Ensure parent directory exists
      const dirPath = localPath.substring(0, localPath.lastIndexOf('/'));
      await this.ensureDirectoryExists(dirPath);

      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) {
            onProgress(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        console.log('[FileService] ✅ Download complete:', result.uri);
        return result.uri;
      } else {
        throw new Error('Download failed - no URI returned');
      }
    } catch (error) {
      console.error('[FileService] ❌ Download failed:', error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Download song audio file
   * @param {string} songId - Song ID
   * @param {string} url - Remote URL
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} Local file path
   */
  async downloadSongAudio(songId, url, onProgress = null) {
    const filename = `${songId}.mp3`;
    const localPath = `${this.audioDir}${filename}`;
    return await this.downloadFile(url, localPath, onProgress);
  }

  /**
   * Download song image
   * @param {string} songId - Song ID
   * @param {string} url - Remote URL
   * @returns {Promise<string>} Local file path
   */
  async downloadSongImage(songId, url) {
    const extension = url.split('.').pop().split('?')[0] || 'jpg';
    const filename = `${songId}.${extension}`;
    const localPath = `${this.imagesDir}${filename}`;
    return await this.downloadFile(url, localPath);
  }

  /**
   * Delete a file
   * @param {string} filePath - File path to delete
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteFile(filePath) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        console.log('[FileService] ✅ File deleted:', filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[FileService] ❌ Delete failed:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Delete song files (audio and image)
   * @param {string} audioPath - Audio file path
   * @param {string} imagePath - Image file path (optional)
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteSongFiles(audioPath, imagePath = null) {
    try {
      let deleted = false;

      if (audioPath) {
        deleted = await this.deleteFile(audioPath) || deleted;
      }

      if (imagePath) {
        deleted = await this.deleteFile(imagePath) || deleted;
      }

      return deleted;
    } catch (error) {
      console.error('[FileService] ❌ Delete song files failed:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - File path
   * @returns {Promise<boolean>} True if exists
   */
  async fileExists(filePath) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file size
   * @param {string} filePath - File path
   * @returns {Promise<number>} File size in bytes
   */
  async getFileSize(filePath) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists ? fileInfo.size : 0;
    } catch (error) {
      console.error('[FileService] ❌ Get file size failed:', error);
      return 0;
    }
  }

  /**
   * Get directory size
   * @param {string} dirPath - Directory path
   * @returns {Promise<number>} Total size in bytes
   */
  async getDirectorySize(dirPath) {
    try {
      let totalSize = 0;
      const items = await FileSystem.readDirectoryAsync(dirPath);

      for (const item of items) {
        const itemPath = `${dirPath}${item}`;
        const info = await FileSystem.getInfoAsync(itemPath);

        if (info.exists) {
          if (info.isDirectory) {
            totalSize += await this.getDirectorySize(`${itemPath}/`);
          } else {
            totalSize += info.size || 0;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('[FileService] ❌ Get directory size failed:', error);
      return 0;
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage stats
   */
  async getStorageStats() {
    try {
      const audioSize = await this.getDirectorySize(this.audioDir);
      const imagesSize = await this.getDirectorySize(this.imagesDir);
      const avatarsSize = await this.getDirectorySize(this.avatarsDir);
      const cacheSize = await this.getDirectorySize(this.cacheDir);

      const totalSize = audioSize + imagesSize + avatarsSize + cacheSize;

      return {
        audio: audioSize,
        images: imagesSize,
        avatars: avatarsSize,
        cache: cacheSize,
        total: totalSize,
        audioMB: (audioSize / 1024 / 1024).toFixed(2),
        imagesMB: (imagesSize / 1024 / 1024).toFixed(2),
        avatarsMB: (avatarsSize / 1024 / 1024).toFixed(2),
        cacheMB: (cacheSize / 1024 / 1024).toFixed(2),
        totalMB: (totalSize / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('[FileService] ❌ Get storage stats failed:', error);
      return { total: 0, totalMB: '0.00' };
    }
  }

  /**
   * Clear cache directory
   * @returns {Promise<boolean>} True if cleared
   */
  async clearCache() {
    try {
      console.log('[FileService] Clearing cache...');
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
      await this.ensureDirectoryExists(this.cacheDir);
      console.log('[FileService] ✅ Cache cleared');
      return true;
    } catch (error) {
      console.error('[FileService] ❌ Clear cache failed:', error);
      throw error;
    }
  }

  /**
   * Delete all song files
   * WARNING: This deletes all downloaded songs
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteAllSongs() {
    try {
      console.log('[FileService] ⚠️ Deleting all songs...');
      await FileSystem.deleteAsync(this.audioDir, { idempotent: true });
      await FileSystem.deleteAsync(this.imagesDir, { idempotent: true });
      await this.ensureDirectoryExists(this.audioDir);
      await this.ensureDirectoryExists(this.imagesDir);
      console.log('[FileService] ✅ All songs deleted');
      return true;
    } catch (error) {
      console.error('[FileService] ❌ Delete all songs failed:', error);
      throw error;
    }
  }

  /**
   * Move file
   * @param {string} from - Source path
   * @param {string} to - Destination path
   * @returns {Promise<boolean>} True if moved
   */
  async moveFile(from, to) {
    try {
      await FileSystem.moveAsync({ from, to });
      console.log('[FileService] ✅ File moved:', from, '→', to);
      return true;
    } catch (error) {
      console.error('[FileService] ❌ Move file failed:', error);
      throw error;
    }
  }

  /**
   * Copy file
   * @param {string} from - Source path
   * @param {string} to - Destination path
   * @returns {Promise<boolean>} True if copied
   */
  async copyFile(from, to) {
    try {
      await FileSystem.copyAsync({ from, to });
      console.log('[FileService] ✅ File copied:', from, '→', to);
      return true;
    } catch (error) {
      console.error('[FileService] ❌ Copy file failed:', error);
      throw error;
    }
  }

  /**
   * Log storage information
   * @private
   */
  async logStorageInfo() {
    try {
      const stats = await this.getStorageStats();
      console.log('[FileService] 📊 Storage Statistics:');
      console.log('  Audio:', stats.audioMB, 'MB');
      console.log('  Images:', stats.imagesMB, 'MB');
      console.log('  Avatars:', stats.avatarsMB, 'MB');
      console.log('  Cache:', stats.cacheMB, 'MB');
      console.log('  Total:', stats.totalMB, 'MB');
    } catch (error) {
      console.error('[FileService] ❌ Log storage info failed:', error);
    }
  }

  /**
   * Get file URI for a song audio
   * @param {string} songId - Song ID
   * @returns {string} File URI
   */
  getSongAudioPath(songId) {
    return `${this.audioDir}${songId}.mp3`;
  }

  /**
   * Get file URI for a song image
   * @param {string} songId - Song ID
   * @param {string} extension - File extension (default: jpg)
   * @returns {string} File URI
   */
  getSongImagePath(songId, extension = 'jpg') {
    return `${this.imagesDir}${songId}.${extension}`;
  }

  /**
   * Get file URI for child avatar
   * @param {string} childId - Child ID
   * @param {string} extension - File extension (default: jpg)
   * @returns {string} File URI
   */
  getChildAvatarPath(childId, extension = 'jpg') {
    return `${this.avatarsDir}${childId}.${extension}`;
  }

  /**
   * Get service info
   * @returns {Object} Service information
   */
  getInfo() {
    return {
      initialized: this.isInitialized,
      baseDir: this.baseDir,
      directories: {
        songs: this.songsDir,
        audio: this.audioDir,
        images: this.imagesDir,
        children: this.childrenDir,
        avatars: this.avatarsDir,
        cache: this.cacheDir
      }
    };
  }
}

// Export singleton instance
export default new FileService();
