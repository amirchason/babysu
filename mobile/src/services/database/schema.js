/**
 * schema.js
 * Database schema definitions for BabySu mobile app
 * Defines all tables, indexes, and default data
 */

export const SCHEMA = {
  // All CREATE TABLE statements
  TABLES: [
    // Children profiles table
    `CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      age REAL NOT NULL,
      gender TEXT,
      interests TEXT,
      avatar_path TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_to_cloud INTEGER DEFAULT 0
    )`,

    // Songs table
    `CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      child_ids TEXT NOT NULL,
      topic TEXT,
      category TEXT,
      style TEXT,
      lyrics TEXT,
      duration INTEGER,
      image_url TEXT,
      image_local_path TEXT,
      audio_remote_url TEXT,
      audio_local_path TEXT,
      is_downloaded INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      play_count INTEGER DEFAULT 0,
      last_played_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      task_id TEXT,
      generation_status TEXT DEFAULT 'pending',
      generation_error TEXT,
      file_size INTEGER,
      synced_to_cloud INTEGER DEFAULT 0
    )`,

    // Settings table (key-value store)
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`,

    // Downloads queue table
    `CREATE TABLE IF NOT EXISTS downloads_queue (
      id TEXT PRIMARY KEY NOT NULL,
      song_id TEXT NOT NULL,
      file_type TEXT NOT NULL,
      remote_url TEXT NOT NULL,
      local_path TEXT,
      status TEXT DEFAULT 'pending',
      progress REAL DEFAULT 0,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      started_at INTEGER,
      completed_at INTEGER,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    )`,

    // Playback history table (optional but useful)
    `CREATE TABLE IF NOT EXISTS playback_history (
      id TEXT PRIMARY KEY NOT NULL,
      song_id TEXT NOT NULL,
      child_id TEXT,
      played_at INTEGER NOT NULL,
      duration_played INTEGER,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL
    )`
  ],

  // All CREATE INDEX statements for performance optimization
  INDEXES: [
    // Children indexes
    `CREATE INDEX IF NOT EXISTS idx_children_name ON children(name)`,
    `CREATE INDEX IF NOT EXISTS idx_children_created_at ON children(created_at DESC)`,

    // Songs indexes
    `CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title)`,
    `CREATE INDEX IF NOT EXISTS idx_songs_child_ids ON songs(child_ids)`,
    `CREATE INDEX IF NOT EXISTS idx_songs_category ON songs(category)`,
    `CREATE INDEX IF NOT EXISTS idx_songs_is_favorite ON songs(is_favorite)`,
    `CREATE INDEX IF NOT EXISTS idx_songs_is_downloaded ON songs(is_downloaded)`,
    `CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_songs_generation_status ON songs(generation_status)`,
    `CREATE INDEX IF NOT EXISTS idx_songs_task_id ON songs(task_id)`,
    `CREATE INDEX IF NOT EXISTS idx_songs_play_count ON songs(play_count DESC)`,

    // Downloads queue indexes
    `CREATE INDEX IF NOT EXISTS idx_downloads_song_id ON downloads_queue(song_id)`,
    `CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads_queue(status)`,
    `CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads_queue(created_at DESC)`,

    // Playback history indexes
    `CREATE INDEX IF NOT EXISTS idx_playback_song_id ON playback_history(song_id)`,
    `CREATE INDEX IF NOT EXISTS idx_playback_child_id ON playback_history(child_id)`,
    `CREATE INDEX IF NOT EXISTS idx_playback_played_at ON playback_history(played_at DESC)`
  ],

  // Default settings to insert on first run
  DEFAULT_SETTINGS: [
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('theme', 'light', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('auto_download', 'true', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('download_quality', 'high', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('offline_mode', 'false', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('max_cache_size_mb', '500', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('auto_play_next', 'true', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('notifications_enabled', 'true', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('app_version', '1.0.0', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('last_sync_time', '0', ${Date.now()})`,
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('onboarding_completed', 'false', ${Date.now()})`
  ]
};

/**
 * Song generation status values:
 * - 'pending': Song creation requested, not yet submitted to API
 * - 'processing': Song is being generated by AI
 * - 'completed': Song generation complete, ready to download/stream
 * - 'failed': Song generation failed
 * - 'downloaded': Song audio file downloaded to device
 */

/**
 * Download queue status values:
 * - 'pending': Waiting to start download
 * - 'downloading': Currently downloading
 * - 'paused': Download paused by user
 * - 'completed': Download successful
 * - 'failed': Download failed (check error_message)
 */

/**
 * File types for downloads:
 * - 'audio': MP3 audio file
 * - 'image': Song cover image
 * - 'avatar': Child avatar image
 */

export default SCHEMA;
