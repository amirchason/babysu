/**
 * SongRepository.js
 * Repository for managing songs in local SQLite database
 * Handles all CRUD operations for songs table
 */

import DatabaseService from './DatabaseService';
import { generateId, stringToIds, idsToString } from '../../utils/helpers';

class SongRepository {
  /**
   * Create a new song
   * @param {Object} songData - Song data
   * @returns {Promise<Object>} Created song with generated ID
   */
  async create(songData) {
    try {
      console.log('[SongRepository] Creating new song:', songData.title);

      // Validation
      if (!songData.title || songData.title.trim().length === 0) {
        throw new Error('Song title is required');
      }
      if (!songData.child_ids || songData.child_ids.length === 0) {
        throw new Error('At least one child ID is required');
      }

      // Generate unique ID
      const id = songData.id || generateId('song');
      const now = Date.now();

      // Convert child_ids array to comma-separated string
      const childIdsStr = Array.isArray(songData.child_ids)
        ? idsToString(songData.child_ids)
        : songData.child_ids;

      const sql = `
        INSERT INTO songs (
          id, title, child_ids, topic, category, style, lyrics,
          duration, image_url, image_local_path, audio_remote_url,
          audio_local_path, is_downloaded, is_favorite, play_count,
          last_played_at, created_at, updated_at, task_id,
          generation_status, generation_error, file_size, synced_to_cloud
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id,
        songData.title.trim(),
        childIdsStr,
        songData.topic || null,
        songData.category || 'general',
        songData.style || null,
        songData.lyrics || null,
        songData.duration || null,
        songData.image_url || null,
        songData.image_local_path || null,
        songData.audio_remote_url || null,
        songData.audio_local_path || null,
        songData.is_downloaded ? 1 : 0,
        songData.is_favorite ? 1 : 0,
        songData.play_count || 0,
        songData.last_played_at || null,
        now,
        now,
        songData.task_id || null,
        songData.generation_status || 'pending',
        songData.generation_error || null,
        songData.file_size || null,
        0
      ];

      await DatabaseService.executeQuery(sql, params);

      console.log('[SongRepository] ✅ Song created:', id);

      return await this.findById(id);
    } catch (error) {
      console.error('[SongRepository] ❌ Create failed:', error);
      throw new Error(`Failed to create song: ${error.message}`);
    }
  }

  /**
   * Find all songs
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of song objects
   */
  async findAll(options = {}) {
    try {
      console.log('[SongRepository] Finding all songs');

      const sortBy = options.sortBy || 'created_at';
      const order = options.order || 'DESC';
      const limit = options.limit || null;

      let sql = `
        SELECT * FROM songs
        ORDER BY ${sortBy} ${order}
      `;

      if (limit) {
        sql += ` LIMIT ${limit}`;
      }

      const rows = await DatabaseService.getAll(sql);
      const songs = rows.map(song => this._parseSong(song));

      console.log(`[SongRepository] Found ${songs.length} songs`);
      return songs;
    } catch (error) {
      console.error('[SongRepository] ❌ FindAll failed:', error);
      throw new Error(`Failed to find songs: ${error.message}`);
    }
  }

  /**
   * Find song by ID
   * @param {string} id - Song ID
   * @returns {Promise<Object|null>} Song object or null
   */
  async findById(id) {
    try {
      console.log('[SongRepository] Finding song by ID:', id);

      const sql = `SELECT * FROM songs WHERE id = ?`;
      const row = await DatabaseService.getFirst(sql, [id]);

      if (!row) {
        console.log('[SongRepository] Song not found:', id);
        return null;
      }

      const song = this._parseSong(row);
      console.log('[SongRepository] ✅ Song found:', song.title);
      return song;
    } catch (error) {
      console.error('[SongRepository] ❌ FindById failed:', error);
      throw new Error(`Failed to find song: ${error.message}`);
    }
  }

  /**
   * Find songs by child ID
   * @param {string} childId - Child ID
   * @returns {Promise<Array>} Array of songs for this child
   */
  async findByChildId(childId) {
    try {
      console.log('[SongRepository] Finding songs for child:', childId);

      const sql = `
        SELECT * FROM songs
        WHERE child_ids LIKE ?
        ORDER BY created_at DESC
      `;

      const rows = await DatabaseService.getAll(sql, [`%${childId}%`]);
      const songs = rows.map(song => this._parseSong(song));

      console.log(`[SongRepository] Found ${songs.length} songs for child`);
      return songs;
    } catch (error) {
      console.error('[SongRepository] ❌ FindByChildId failed:', error);
      throw new Error(`Failed to find songs by child ID: ${error.message}`);
    }
  }

  /**
   * Find favorite songs
   * @returns {Promise<Array>} Array of favorite songs
   */
  async findFavorites() {
    try {
      console.log('[SongRepository] Finding favorite songs');

      const sql = `
        SELECT * FROM songs
        WHERE is_favorite = 1
        ORDER BY updated_at DESC
      `;

      const rows = await DatabaseService.getAll(sql);
      const songs = rows.map(song => this._parseSong(song));

      console.log(`[SongRepository] Found ${songs.length} favorite songs`);
      return songs;
    } catch (error) {
      console.error('[SongRepository] ❌ FindFavorites failed:', error);
      throw new Error(`Failed to find favorites: ${error.message}`);
    }
  }

  /**
   * Find downloaded songs
   * @returns {Promise<Array>} Array of downloaded songs
   */
  async findDownloaded() {
    try {
      console.log('[SongRepository] Finding downloaded songs');

      const sql = `
        SELECT * FROM songs
        WHERE is_downloaded = 1
        ORDER BY updated_at DESC
      `;

      const rows = await DatabaseService.getAll(sql);
      const songs = rows.map(song => this._parseSong(song));

      console.log(`[SongRepository] Found ${songs.length} downloaded songs`);
      return songs;
    } catch (error) {
      console.error('[SongRepository] ❌ FindDownloaded failed:', error);
      throw new Error(`Failed to find downloaded songs: ${error.message}`);
    }
  }

  /**
   * Find songs by generation status
   * @param {string} status - Generation status (pending, processing, completed, failed)
   * @returns {Promise<Array>} Array of songs with this status
   */
  async findByStatus(status) {
    try {
      console.log('[SongRepository] Finding songs by status:', status);

      const sql = `
        SELECT * FROM songs
        WHERE generation_status = ?
        ORDER BY created_at DESC
      `;

      const rows = await DatabaseService.getAll(sql, [status]);
      const songs = rows.map(song => this._parseSong(song));

      console.log(`[SongRepository] Found ${songs.length} songs with status: ${status}`);
      return songs;
    } catch (error) {
      console.error('[SongRepository] ❌ FindByStatus failed:', error);
      throw new Error(`Failed to find songs by status: ${error.message}`);
    }
  }

  /**
   * Find songs by category
   * @param {string} category - Song category
   * @returns {Promise<Array>} Array of songs in this category
   */
  async findByCategory(category) {
    try {
      console.log('[SongRepository] Finding songs by category:', category);

      const sql = `
        SELECT * FROM songs
        WHERE category = ?
        ORDER BY created_at DESC
      `;

      const rows = await DatabaseService.getAll(sql, [category]);
      const songs = rows.map(song => this._parseSong(song));

      console.log(`[SongRepository] Found ${songs.length} songs in category`);
      return songs;
    } catch (error) {
      console.error('[SongRepository] ❌ FindByCategory failed:', error);
      throw new Error(`Failed to find songs by category: ${error.message}`);
    }
  }

  /**
   * Search songs by title or lyrics
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching songs
   */
  async search(query) {
    try {
      console.log('[SongRepository] Searching songs:', query);

      if (!query || query.trim().length === 0) {
        return await this.findAll();
      }

      const sql = `
        SELECT * FROM songs
        WHERE title LIKE ? OR lyrics LIKE ?
        ORDER BY created_at DESC
      `;

      const searchPattern = `%${query}%`;
      const rows = await DatabaseService.getAll(sql, [searchPattern, searchPattern]);
      const songs = rows.map(song => this._parseSong(song));

      console.log(`[SongRepository] Found ${songs.length} matching songs`);
      return songs;
    } catch (error) {
      console.error('[SongRepository] ❌ Search failed:', error);
      throw new Error(`Failed to search songs: ${error.message}`);
    }
  }

  /**
   * Update song
   * @param {string} id - Song ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated song object
   */
  async update(id, updates) {
    try {
      console.log('[SongRepository] Updating song:', id);

      const existingSong = await this.findById(id);
      if (!existingSong) {
        throw new Error(`Song not found: ${id}`);
      }

      const allowedFields = [
        'title', 'child_ids', 'topic', 'category', 'style', 'lyrics',
        'duration', 'image_url', 'image_local_path', 'audio_remote_url',
        'audio_local_path', 'is_downloaded', 'is_favorite', 'play_count',
        'last_played_at', 'task_id', 'generation_status', 'generation_error',
        'file_size'
      ];

      const updateFields = [];
      const params = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);

          // Handle special fields
          if (key === 'child_ids' && Array.isArray(value)) {
            params.push(idsToString(value));
          } else if (key === 'is_downloaded' || key === 'is_favorite') {
            params.push(value ? 1 : 0);
          } else {
            params.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        console.log('[SongRepository] No valid fields to update');
        return existingSong;
      }

      updateFields.push('updated_at = ?');
      params.push(Date.now());
      params.push(id);

      const sql = `
        UPDATE songs
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await DatabaseService.executeQuery(sql, params);

      console.log('[SongRepository] ✅ Song updated:', id);
      return await this.findById(id);
    } catch (error) {
      console.error('[SongRepository] ❌ Update failed:', error);
      throw new Error(`Failed to update song: ${error.message}`);
    }
  }

  /**
   * Toggle favorite status
   * @param {string} id - Song ID
   * @returns {Promise<Object>} Updated song
   */
  async toggleFavorite(id) {
    try {
      console.log('[SongRepository] Toggling favorite:', id);

      const song = await this.findById(id);
      if (!song) {
        throw new Error(`Song not found: ${id}`);
      }

      return await this.update(id, { is_favorite: !song.is_favorite });
    } catch (error) {
      console.error('[SongRepository] ❌ Toggle favorite failed:', error);
      throw new Error(`Failed to toggle favorite: ${error.message}`);
    }
  }

  /**
   * Mark song as downloaded
   * @param {string} id - Song ID
   * @param {string} audioPath - Local path to audio file
   * @param {string} imagePath - Local path to image file (optional)
   * @param {number} fileSize - File size in bytes (optional)
   * @returns {Promise<Object>} Updated song
   */
  async markAsDownloaded(id, audioPath, imagePath = null, fileSize = null) {
    try {
      console.log('[SongRepository] Marking as downloaded:', id);

      const updates = {
        is_downloaded: true,
        audio_local_path: audioPath,
        generation_status: 'downloaded'
      };

      if (imagePath) {
        updates.image_local_path = imagePath;
      }

      if (fileSize) {
        updates.file_size = fileSize;
      }

      return await this.update(id, updates);
    } catch (error) {
      console.error('[SongRepository] ❌ Mark as downloaded failed:', error);
      throw new Error(`Failed to mark as downloaded: ${error.message}`);
    }
  }

  /**
   * Update generation status
   * @param {string} id - Song ID
   * @param {string} status - New status
   * @param {string} error - Error message (optional)
   * @returns {Promise<Object>} Updated song
   */
  async updateGenerationStatus(id, status, error = null) {
    try {
      console.log('[SongRepository] Updating generation status:', id, status);

      const updates = {
        generation_status: status
      };

      if (error) {
        updates.generation_error = error;
      }

      return await this.update(id, updates);
    } catch (error) {
      console.error('[SongRepository] ❌ Update status failed:', error);
      throw new Error(`Failed to update generation status: ${error.message}`);
    }
  }

  /**
   * Increment play count
   * @param {string} id - Song ID
   * @returns {Promise<Object>} Updated song
   */
  async incrementPlayCount(id) {
    try {
      console.log('[SongRepository] Incrementing play count:', id);

      const song = await this.findById(id);
      if (!song) {
        throw new Error(`Song not found: ${id}`);
      }

      return await this.update(id, {
        play_count: song.play_count + 1,
        last_played_at: Date.now()
      });
    } catch (error) {
      console.error('[SongRepository] ❌ Increment play count failed:', error);
      throw new Error(`Failed to increment play count: ${error.message}`);
    }
  }

  /**
   * Delete song
   * @param {string} id - Song ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    try {
      console.log('[SongRepository] Deleting song:', id);

      const song = await this.findById(id);
      if (!song) {
        throw new Error(`Song not found: ${id}`);
      }

      const sql = `DELETE FROM songs WHERE id = ?`;
      await DatabaseService.executeQuery(sql, [id]);

      console.log('[SongRepository] ✅ Song deleted:', id);
      return true;
    } catch (error) {
      console.error('[SongRepository] ❌ Delete failed:', error);
      throw new Error(`Failed to delete song: ${error.message}`);
    }
  }

  /**
   * Get total count of songs
   * @returns {Promise<number>} Total number of songs
   */
  async count() {
    try {
      const sql = `SELECT COUNT(*) as count FROM songs`;
      const result = await DatabaseService.getFirst(sql);
      return result?.count || 0;
    } catch (error) {
      console.error('[SongRepository] ❌ Count failed:', error);
      throw new Error(`Failed to count songs: ${error.message}`);
    }
  }

  /**
   * Get statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    try {
      const sql = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favorites,
          SUM(CASE WHEN is_downloaded = 1 THEN 1 ELSE 0 END) as downloaded,
          SUM(CASE WHEN generation_status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN generation_status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN generation_status = 'processing' THEN 1 ELSE 0 END) as processing,
          SUM(play_count) as total_plays,
          SUM(file_size) as total_storage
        FROM songs
      `;

      const stats = await DatabaseService.getFirst(sql);

      return {
        total: stats?.total || 0,
        favorites: stats?.favorites || 0,
        downloaded: stats?.downloaded || 0,
        completed: stats?.completed || 0,
        pending: stats?.pending || 0,
        processing: stats?.processing || 0,
        totalPlays: stats?.total_plays || 0,
        totalStorage: stats?.total_storage || 0
      };
    } catch (error) {
      console.error('[SongRepository] ❌ Get stats failed:', error);
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * Get most played songs
   * @param {number} limit - Number of songs to return
   * @returns {Promise<Array>} Array of most played songs
   */
  async getMostPlayed(limit = 10) {
    try {
      const sql = `
        SELECT * FROM songs
        WHERE play_count > 0
        ORDER BY play_count DESC, last_played_at DESC
        LIMIT ?
      `;

      const rows = await DatabaseService.getAll(sql, [limit]);
      return rows.map(song => this._parseSong(song));
    } catch (error) {
      console.error('[SongRepository] ❌ Get most played failed:', error);
      throw new Error(`Failed to get most played: ${error.message}`);
    }
  }

  /**
   * Get recently played songs
   * @param {number} limit - Number of songs to return
   * @returns {Promise<Array>} Array of recently played songs
   */
  async getRecentlyPlayed(limit = 10) {
    try {
      const sql = `
        SELECT * FROM songs
        WHERE last_played_at IS NOT NULL
        ORDER BY last_played_at DESC
        LIMIT ?
      `;

      const rows = await DatabaseService.getAll(sql, [limit]);
      return rows.map(song => this._parseSong(song));
    } catch (error) {
      console.error('[SongRepository] ❌ Get recently played failed:', error);
      throw new Error(`Failed to get recently played: ${error.message}`);
    }
  }

  /**
   * Parse song row from database
   * @private
   */
  _parseSong(row) {
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      child_ids: stringToIds(row.child_ids),
      topic: row.topic,
      category: row.category,
      style: row.style,
      lyrics: row.lyrics,
      duration: row.duration,
      image_url: row.image_url,
      image_local_path: row.image_local_path,
      audio_remote_url: row.audio_remote_url,
      audio_local_path: row.audio_local_path,
      is_downloaded: Boolean(row.is_downloaded),
      is_favorite: Boolean(row.is_favorite),
      play_count: row.play_count || 0,
      last_played_at: row.last_played_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      task_id: row.task_id,
      generation_status: row.generation_status,
      generation_error: row.generation_error,
      file_size: row.file_size,
      synced_to_cloud: Boolean(row.synced_to_cloud)
    };
  }
}

// Export singleton instance
export default new SongRepository();
