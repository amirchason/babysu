/**
 * In-Memory Mock Database for Development
 * Replaces Firebase when credentials are not available
 * Data persists during server runtime but resets on restart
 */

const logger = require('../utils/logger');

class MockDatabase {
  constructor() {
    this.collections = {
      users: new Map(),
      children: new Map(),
      songs: new Map(),
    };

    logger.info('📦 Mock Database initialized (in-memory storage)');
  }

  /**
   * Simulate Firestore collection reference
   */
  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new Map();
    }

    return {
      // Get document by ID
      doc: (id) => {
        const self = this;
        const docId = id || this._generateId();

        return {
          id: docId,

          // Get document
          get: async () => {
            const data = self.collections[name].get(docId);
            return {
              exists: !!data,
              id: docId,
              data: () => data,
            };
          },

          // Set document
          set: async (data) => {
            self.collections[name].set(docId, { ...data, _id: docId });
            logger.debug(`Mock DB: Set ${name}/${docId}`);
            return { id: docId };
          },

          // Update document
          update: async (updates) => {
            const existing = self.collections[name].get(docId);
            if (!existing) {
              throw new Error('Document not found');
            }
            const updated = { ...existing, ...updates };
            self.collections[name].set(docId, updated);
            logger.debug(`Mock DB: Updated ${name}/${docId}`);
            return { id: docId };
          },

          // Delete document
          delete: async () => {
            self.collections[name].delete(docId);
            logger.debug(`Mock DB: Deleted ${name}/${docId}`);
            return;
          },
        };
      },

      // Query methods
      where: (field, operator, value) => {
        const self = this;
        let filters = [{ field, operator, value }];
        let orderByClause = null;
        let limitCount = null;

        const queryObject = {
          where: (field, operator, value) => {
            filters.push({ field, operator, value });
            return queryObject;
          },

          orderBy: (field, direction = 'asc') => {
            orderByClause = { field, direction };
            return queryObject;
          },

          limit: (count) => {
            limitCount = count;
            return queryObject;
          },

          get: async () => {
            let results = Array.from(self.collections[name].values());

            // Apply filters
            filters.forEach(filter => {
              results = results.filter(doc => {
                const docValue = doc[filter.field];
                switch (filter.operator) {
                  case '==':
                    return docValue === filter.value;
                  case '!=':
                    return docValue !== filter.value;
                  case '>':
                    return docValue > filter.value;
                  case '>=':
                    return docValue >= filter.value;
                  case '<':
                    return docValue < filter.value;
                  case '<=':
                    return docValue <= filter.value;
                  case 'array-contains':
                    return Array.isArray(docValue) && docValue.includes(filter.value);
                  default:
                    return true;
                }
              });
            });

            // Apply ordering
            if (orderByClause) {
              results.sort((a, b) => {
                const aVal = a[orderByClause.field];
                const bVal = b[orderByClause.field];
                if (aVal < bVal) return orderByClause.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return orderByClause.direction === 'asc' ? 1 : -1;
                return 0;
              });
            }

            // Apply limit
            if (limitCount) {
              results = results.slice(0, limitCount);
            }

            return {
              docs: results.map(doc => ({
                id: doc._id,
                data: () => doc,
              })),
              empty: results.length === 0,
              size: results.length,
            };
          },
        };

        return queryObject;
      },

      // Get all documents
      get: async () => {
        const results = Array.from(self.collections[name].values());
        return {
          docs: results.map(doc => ({
            id: doc._id,
            data: () => doc,
          })),
          empty: results.length === 0,
          size: results.length,
        };
      },
    };
  }

  /**
   * Generate unique ID (similar to Firebase)
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get database stats
   */
  getStats() {
    return {
      users: this.collections.users.size,
      children: this.collections.children.size,
      songs: this.collections.songs.size,
    };
  }

  /**
   * Clear all data (for testing)
   */
  clearAll() {
    this.collections.users.clear();
    this.collections.children.clear();
    this.collections.songs.clear();
    logger.info('🗑️  Mock Database cleared');
  }
}

// Export singleton instance
const mockDb = new MockDatabase();

module.exports = mockDb;
