/**
 * index.js
 * Central export point for all database services
 */

import DatabaseService from './DatabaseService';
import ChildRepository from './ChildRepository';
import SongRepository from './SongRepository';
import { SCHEMA } from './schema';

/**
 * Initialize the database
 * Call this when the app starts
 */
export async function initializeDatabase() {
  try {
    console.log('[Database] Initializing database system...');
    await DatabaseService.initialize();
    console.log('[Database] ✅ Database system ready');
    return true;
  } catch (error) {
    console.error('[Database] ❌ Initialization failed:', error);
    throw error;
  }
}

/**
 * Get database info
 */
export function getDatabaseInfo() {
  return DatabaseService.getInfo();
}

/**
 * Reset database (DEVELOPMENT ONLY)
 * WARNING: Deletes all data
 */
export async function resetDatabase() {
  console.warn('[Database] ⚠️ RESETTING DATABASE - ALL DATA WILL BE LOST');
  return await DatabaseService.reset();
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  return await DatabaseService.close();
}

// Export services
export { DatabaseService, ChildRepository, SongRepository, SCHEMA };

// Export as default object for convenience
export default {
  initialize: initializeDatabase,
  getInfo: getDatabaseInfo,
  reset: resetDatabase,
  close: closeDatabase,
  DatabaseService,
  ChildRepository,
  SongRepository,
  SCHEMA
};
