/**
 * DatabaseService.js
 * Core SQLite database service for BabySu local-first mobile app
 * Handles database initialization, queries, transactions, and migrations
 */

import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.dbName = 'babysu.db';
  }

  /**
   * Initialize the database
   * Creates database, runs migrations, and sets up schema
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[DatabaseService] Already initialized');
      return;
    }

    try {
      console.log('[DatabaseService] Initializing database...');

      // Open database connection
      this.db = await SQLite.openDatabaseAsync(this.dbName);
      console.log('[DatabaseService] Database connection opened');

      // Run migrations
      await this.runMigrations();

      this.isInitialized = true;
      console.log('[DatabaseService] ✅ Database initialized successfully');
    } catch (error) {
      console.error('[DatabaseService] ❌ Initialization failed:', error);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  /**
   * Execute a single SQL query
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query result
   */
  async executeQuery(sql, params = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('[DatabaseService] Executing query:', sql.substring(0, 50) + '...');
      const result = await this.db.runAsync(sql, params);
      return result;
    } catch (error) {
      console.error('[DatabaseService] Query failed:', {
        sql: sql.substring(0, 100),
        params,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Array} queries - Array of {sql, params} objects
   * @returns {Promise} Transaction result
   */
  async executeTransaction(queries) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`[DatabaseService] Starting transaction with ${queries.length} queries`);

      await this.db.withTransactionAsync(async () => {
        for (const query of queries) {
          await this.db.runAsync(query.sql, query.params || []);
        }
      });

      console.log('[DatabaseService] ✅ Transaction completed successfully');
      return { success: true };
    } catch (error) {
      console.error('[DatabaseService] ❌ Transaction failed:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Get all rows from a query
   * @param {string} sql - SELECT query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Array of rows
   */
  async getAll(sql, params = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('[DatabaseService] Getting all rows:', sql.substring(0, 50) + '...');
      const result = await this.db.getAllAsync(sql, params);
      console.log(`[DatabaseService] Retrieved ${result.length} rows`);
      return result;
    } catch (error) {
      console.error('[DatabaseService] getAll failed:', error);
      throw error;
    }
  }

  /**
   * Get first row from a query
   * @param {string} sql - SELECT query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>} First row or null
   */
  async getFirst(sql, params = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('[DatabaseService] Getting first row:', sql.substring(0, 50) + '...');
      const result = await this.db.getFirstAsync(sql, params);
      return result || null;
    } catch (error) {
      console.error('[DatabaseService] getFirst failed:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   * Creates all tables and indexes
   */
  async runMigrations() {
    try {
      console.log('[DatabaseService] Running migrations...');

      // Check if schema_version table exists
      const versionTableExists = await this.db.getFirstAsync(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'`
      );

      let currentVersion = 0;
      if (versionTableExists) {
        const versionRow = await this.db.getFirstAsync(
          'SELECT MAX(version) as version FROM schema_version'
        );
        currentVersion = versionRow?.version || 0;
      }

      console.log(`[DatabaseService] Current schema version: ${currentVersion}`);

      // Run migration if needed
      if (currentVersion === 0) {
        console.log('[DatabaseService] Running initial migration (v1)...');
        await this.runInitialMigration();
        console.log('[DatabaseService] ✅ Initial migration complete');
      }

      console.log('[DatabaseService] ✅ All migrations complete');
    } catch (error) {
      console.error('[DatabaseService] ❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Run initial database migration (v1)
   * Creates all tables, indexes, and default data
   */
  async runInitialMigration() {
    await this.db.withTransactionAsync(async () => {
      // Create all tables from schema
      for (const createTable of SCHEMA.TABLES) {
        await this.db.runAsync(createTable);
      }

      // Create all indexes
      for (const createIndex of SCHEMA.INDEXES) {
        await this.db.runAsync(createIndex);
      }

      // Insert default settings
      for (const setting of SCHEMA.DEFAULT_SETTINGS) {
        await this.db.runAsync(setting);
      }

      // Create schema_version table and insert version
      await this.db.runAsync(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY NOT NULL,
          applied_at INTEGER NOT NULL,
          description TEXT
        )
      `);

      await this.db.runAsync(
        `INSERT INTO schema_version (version, applied_at, description) VALUES (?, ?, ?)`,
        [1, Date.now(), 'Initial schema creation']
      );
    });
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('[DatabaseService] Database closed');
    }
  }

  /**
   * Reset database (DELETE ALL DATA - USE WITH CAUTION!)
   * For development/testing only
   */
  async reset() {
    try {
      console.log('[DatabaseService] ⚠️ RESETTING DATABASE - ALL DATA WILL BE LOST');

      if (this.db) {
        await this.db.closeAsync();
      }

      // Delete database file
      await SQLite.deleteDatabaseAsync(this.dbName);

      this.db = null;
      this.isInitialized = false;

      // Reinitialize
      await this.initialize();

      console.log('[DatabaseService] ✅ Database reset complete');
    } catch (error) {
      console.error('[DatabaseService] ❌ Reset failed:', error);
      throw error;
    }
  }

  /**
   * Get database info
   * @returns {Object} Database information
   */
  getInfo() {
    return {
      name: this.dbName,
      initialized: this.isInitialized,
      connection: this.db ? 'open' : 'closed'
    };
  }
}

// Export singleton instance
export default new DatabaseService();
