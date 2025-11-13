/**
 * index.js
 * Central export for all storage services
 */

import FileService from './FileService';
import DownloadManager from './DownloadManager';
import CacheManager from './CacheManager';

/**
 * Initialize all storage services
 */
export async function initializeStorage() {
  try {
    console.log('[Storage] Initializing storage services...');

    await FileService.initialize();
    await CacheManager.initialize();

    console.log('[Storage] ✅ Storage services ready');
    return true;
  } catch (error) {
    console.error('[Storage] ❌ Initialization failed:', error);
    throw error;
  }
}

export {
  FileService,
  DownloadManager,
  CacheManager
};

export default {
  initialize: initializeStorage,
  FileService,
  DownloadManager,
  CacheManager
};
