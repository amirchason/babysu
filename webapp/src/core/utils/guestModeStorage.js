/**
 * Guest Mode Local Storage Mock Data Layer
 *
 * Provides localStorage-based CRUD operations for guest mode users
 * Simulates backend API behavior without requiring server connection
 */

const STORAGE_KEYS = {
  CHILDREN: 'guest_children',
  SONGS: 'guest_songs',
};

// Helper to generate unique IDs
const generateId = () => `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// =====================
// CHILDREN OPERATIONS
// =====================

export const guestChildren = {
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHILDREN);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading guest children:', error);
      return [];
    }
  },

  create: (childData) => {
    try {
      const children = guestChildren.getAll();
      const newChild = {
        ...childData,
        id: generateId(),
        _id: generateId(), // Some components use _id
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'guest',
      };
      children.push(newChild);
      localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
      return newChild;
    } catch (error) {
      console.error('Error creating guest child:', error);
      throw error;
    }
  },

  update: (id, data) => {
    try {
      const children = guestChildren.getAll();
      const index = children.findIndex(c => c.id === id || c._id === id);
      if (index === -1) {
        throw new Error('Child not found');
      }
      const updated = {
        ...children[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      children[index] = updated;
      localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
      return updated;
    } catch (error) {
      console.error('Error updating guest child:', error);
      throw error;
    }
  },

  delete: (id) => {
    try {
      const children = guestChildren.getAll();
      const filtered = children.filter(c => c.id !== id && c._id !== id);
      localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(filtered));
      return id;
    } catch (error) {
      console.error('Error deleting guest child:', error);
      throw error;
    }
  },
};

// =====================
// SONGS OPERATIONS
// =====================

export const guestSongs = {
  getAll: (filters = {}) => {
    try {
      let songs = localStorage.getItem(STORAGE_KEYS.SONGS);
      songs = songs ? JSON.parse(songs) : [];

      // Apply filters if provided
      if (filters.childId) {
        songs = songs.filter(s =>
          (s.childrenIds || []).includes(filters.childId) ||
          (s.childIds || []).includes(filters.childId)
        );
      }

      if (filters.status) {
        songs = songs.filter(s => s.status === filters.status);
      }

      return songs;
    } catch (error) {
      console.error('Error reading guest songs:', error);
      return [];
    }
  },

  create: (songData) => {
    try {
      const songs = guestSongs.getAll();
      const newSong = {
        ...songData,
        id: generateId(),
        _id: generateId(),
        status: 'completed', // Guest mode: instant completion
        audioUrl: null, // No real audio in guest mode
        lyrics: null,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'guest',
      };
      songs.push(newSong);
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
      return newSong;
    } catch (error) {
      console.error('Error creating guest song:', error);
      throw error;
    }
  },

  toggleFavorite: (id) => {
    try {
      const songs = guestSongs.getAll();
      const index = songs.findIndex(s => s.id === id || s._id === id);
      if (index === -1) {
        throw new Error('Song not found');
      }
      songs[index].isFavorite = !songs[index].isFavorite;
      songs[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
      return songs[index];
    } catch (error) {
      console.error('Error toggling guest song favorite:', error);
      throw error;
    }
  },

  delete: (id) => {
    try {
      const songs = guestSongs.getAll();
      const filtered = songs.filter(s => s.id !== id && s._id !== id);
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(filtered));
      return id;
    } catch (error) {
      console.error('Error deleting guest song:', error);
      throw error;
    }
  },

  getStatus: (id) => {
    try {
      const songs = guestSongs.getAll();
      const song = songs.find(s => s.id === id || s._id === id);
      return song || null;
    } catch (error) {
      console.error('Error getting guest song status:', error);
      return null;
    }
  },
};

// =====================
// USERS OPERATIONS
// =====================

export const guestUsers = {
  getUsage: () => {
    // Mock usage data for guest mode
    const songs = guestSongs.getAll();
    const completedCount = songs.filter(s => s.status === 'completed').length;

    return {
      used: completedCount,
      remaining: 50 - completedCount,
      limit: 50,
      resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };
  },

  getProfile: () => {
    return {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@babysu.app',
      createdAt: new Date().toISOString(),
    };
  },
};

// =====================
// UTILITY FUNCTIONS
// =====================

export const clearGuestData = () => {
  localStorage.removeItem(STORAGE_KEYS.CHILDREN);
  localStorage.removeItem(STORAGE_KEYS.SONGS);
  console.log('✅ Guest data cleared');
};

export const isGuestMode = () => {
  return localStorage.getItem('guestMode') === 'true';
};

// Seed demo data for better guest experience (optional)
export const seedGuestData = () => {
  if (!isGuestMode()) return;

  const children = guestChildren.getAll();
  const songs = guestSongs.getAll();

  // Only seed if empty
  if (children.length === 0) {
    console.log('📦 Seeding demo children...');
    guestChildren.create({
      name: 'Emma',
      age: 3,
      gender: 'girl',
    });
    guestChildren.create({
      name: 'Liam',
      age: 1.5,
      gender: 'boy',
    });
  }

  if (songs.length === 0 && children.length > 0) {
    console.log('📦 Seeding demo songs...');
    const demoChildren = guestChildren.getAll();
    if (demoChildren.length > 0) {
      guestSongs.create({
        title: 'Bedtime Lullaby for Emma',
        category: 'bedtime',
        topic: 'Peaceful sleep with stars and moon',
        style: 'lullaby',
        childrenIds: [demoChildren[0].id],
        childIds: [demoChildren[0].id],
      });
    }
  }
};
