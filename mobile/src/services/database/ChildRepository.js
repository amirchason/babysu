/**
 * ChildRepository.js
 * Repository for managing child profiles in local SQLite database
 * Handles all CRUD operations for children table
 */

import DatabaseService from './DatabaseService';
import { generateId } from '../../utils/helpers';

class ChildRepository {
  /**
   * Create a new child profile
   * @param {Object} childData - Child data
   * @param {string} childData.name - Child's name (required)
   * @param {number} childData.age - Child's age (required)
   * @param {string} childData.gender - Child's gender (optional)
   * @param {Array<string>} childData.interests - Child's interests (optional)
   * @param {string} childData.avatar_path - Path to avatar image (optional)
   * @returns {Promise<Object>} Created child with generated ID
   */
  async create(childData) {
    try {
      console.log('[ChildRepository] Creating new child:', childData.name);

      // Validation
      if (!childData.name || childData.name.trim().length === 0) {
        throw new Error('Child name is required');
      }
      if (!childData.age || childData.age <= 0) {
        throw new Error('Valid child age is required');
      }

      // Generate unique ID
      const id = childData.id || generateId('child');
      const now = Date.now();

      // Prepare interests as JSON string
      const interests = Array.isArray(childData.interests)
        ? JSON.stringify(childData.interests)
        : JSON.stringify([]);

      // Insert child
      const sql = `
        INSERT INTO children (
          id, name, age, gender, interests, avatar_path,
          created_at, updated_at, synced_to_cloud
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id,
        childData.name.trim(),
        childData.age,
        childData.gender || null,
        interests,
        childData.avatar_path || null,
        now,
        now,
        0
      ];

      await DatabaseService.executeQuery(sql, params);

      console.log('[ChildRepository] ✅ Child created:', id);

      // Return created child
      return await this.findById(id);
    } catch (error) {
      console.error('[ChildRepository] ❌ Create failed:', error);
      throw new Error(`Failed to create child: ${error.message}`);
    }
  }

  /**
   * Find all children
   * @param {Object} options - Query options
   * @param {string} options.sortBy - Field to sort by (default: created_at)
   * @param {string} options.order - Sort order: ASC or DESC (default: DESC)
   * @returns {Promise<Array>} Array of child objects
   */
  async findAll(options = {}) {
    try {
      console.log('[ChildRepository] Finding all children');

      const sortBy = options.sortBy || 'created_at';
      const order = options.order || 'DESC';

      const sql = `
        SELECT * FROM children
        ORDER BY ${sortBy} ${order}
      `;

      const rows = await DatabaseService.getAll(sql);

      // Parse JSON fields
      const children = rows.map(child => this._parseChild(child));

      console.log(`[ChildRepository] Found ${children.length} children`);
      return children;
    } catch (error) {
      console.error('[ChildRepository] ❌ FindAll failed:', error);
      throw new Error(`Failed to find children: ${error.message}`);
    }
  }

  /**
   * Find child by ID
   * @param {string} id - Child ID
   * @returns {Promise<Object|null>} Child object or null if not found
   */
  async findById(id) {
    try {
      console.log('[ChildRepository] Finding child by ID:', id);

      const sql = `SELECT * FROM children WHERE id = ?`;
      const row = await DatabaseService.getFirst(sql, [id]);

      if (!row) {
        console.log('[ChildRepository] Child not found:', id);
        return null;
      }

      const child = this._parseChild(row);
      console.log('[ChildRepository] ✅ Child found:', child.name);
      return child;
    } catch (error) {
      console.error('[ChildRepository] ❌ FindById failed:', error);
      throw new Error(`Failed to find child: ${error.message}`);
    }
  }

  /**
   * Update child profile
   * @param {string} id - Child ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated child object
   */
  async update(id, updates) {
    try {
      console.log('[ChildRepository] Updating child:', id);

      // Check if child exists
      const existingChild = await this.findById(id);
      if (!existingChild) {
        throw new Error(`Child not found: ${id}`);
      }

      // Build dynamic update query
      const allowedFields = ['name', 'age', 'gender', 'interests', 'avatar_path'];
      const updateFields = [];
      const params = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);

          // Handle interests array
          if (key === 'interests') {
            params.push(Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([]));
          } else {
            params.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        console.log('[ChildRepository] No valid fields to update');
        return existingChild;
      }

      // Add updated_at timestamp
      updateFields.push('updated_at = ?');
      params.push(Date.now());

      // Add ID for WHERE clause
      params.push(id);

      const sql = `
        UPDATE children
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await DatabaseService.executeQuery(sql, params);

      console.log('[ChildRepository] ✅ Child updated:', id);

      // Return updated child
      return await this.findById(id);
    } catch (error) {
      console.error('[ChildRepository] ❌ Update failed:', error);
      throw new Error(`Failed to update child: ${error.message}`);
    }
  }

  /**
   * Delete child profile
   * WARNING: This will also delete all songs associated with this child
   * @param {string} id - Child ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    try {
      console.log('[ChildRepository] Deleting child:', id);

      // Check if child exists
      const child = await this.findById(id);
      if (!child) {
        throw new Error(`Child not found: ${id}`);
      }

      const sql = `DELETE FROM children WHERE id = ?`;
      await DatabaseService.executeQuery(sql, [id]);

      console.log('[ChildRepository] ✅ Child deleted:', id);
      return true;
    } catch (error) {
      console.error('[ChildRepository] ❌ Delete failed:', error);
      throw new Error(`Failed to delete child: ${error.message}`);
    }
  }

  /**
   * Search children by name
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching children
   */
  async search(query) {
    try {
      console.log('[ChildRepository] Searching children:', query);

      if (!query || query.trim().length === 0) {
        return await this.findAll();
      }

      const sql = `
        SELECT * FROM children
        WHERE name LIKE ?
        ORDER BY name ASC
      `;

      const rows = await DatabaseService.getAll(sql, [`%${query}%`]);
      const children = rows.map(child => this._parseChild(child));

      console.log(`[ChildRepository] Found ${children.length} matching children`);
      return children;
    } catch (error) {
      console.error('[ChildRepository] ❌ Search failed:', error);
      throw new Error(`Failed to search children: ${error.message}`);
    }
  }

  /**
   * Get total count of children
   * @returns {Promise<number>} Total number of children
   */
  async count() {
    try {
      const sql = `SELECT COUNT(*) as count FROM children`;
      const result = await DatabaseService.getFirst(sql);
      return result?.count || 0;
    } catch (error) {
      console.error('[ChildRepository] ❌ Count failed:', error);
      throw new Error(`Failed to count children: ${error.message}`);
    }
  }

  /**
   * Check if child exists
   * @param {string} id - Child ID
   * @returns {Promise<boolean>} True if child exists
   */
  async exists(id) {
    try {
      const child = await this.findById(id);
      return child !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse child row from database
   * Converts JSON strings to objects
   * @private
   */
  _parseChild(row) {
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      interests: row.interests ? JSON.parse(row.interests) : [],
      avatar_path: row.avatar_path,
      created_at: row.created_at,
      updated_at: row.updated_at,
      synced_to_cloud: Boolean(row.synced_to_cloud)
    };
  }

  /**
   * Batch create multiple children (useful for importing)
   * @param {Array<Object>} children - Array of child data objects
   * @returns {Promise<Array>} Array of created children
   */
  async createMany(children) {
    try {
      console.log(`[ChildRepository] Batch creating ${children.length} children`);

      const queries = children.map(child => {
        const id = child.id || generateId('child');
        const now = Date.now();
        const interests = Array.isArray(child.interests)
          ? JSON.stringify(child.interests)
          : JSON.stringify([]);

        return {
          sql: `
            INSERT INTO children (
              id, name, age, gender, interests, avatar_path,
              created_at, updated_at, synced_to_cloud
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          params: [
            id,
            child.name.trim(),
            child.age,
            child.gender || null,
            interests,
            child.avatar_path || null,
            now,
            now,
            0
          ]
        };
      });

      await DatabaseService.executeTransaction(queries);

      console.log('[ChildRepository] ✅ Batch create complete');
      return await this.findAll();
    } catch (error) {
      console.error('[ChildRepository] ❌ Batch create failed:', error);
      throw new Error(`Failed to batch create children: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new ChildRepository();
