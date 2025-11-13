/**
 * Frontend-Only API Client
 * - Children & Songs: localStorage
 * - Song Generation: Serverless functions (hide API keys)
 */

import axios from 'axios';

// Use serverless functions (Vercel/Netlify) or local dev
const API_BASE = import.meta.env.DEV ? 'http://localhost:5173/api' : '/api';

// ========================================
// LOCALSTORAGE DATABASE
// ========================================

const STORAGE_KEYS = {
  CHILDREN: 'babysu_children',
  SONGS: 'babysu_songs',
  USER: 'babysu_user',
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ========================================
// CHILDREN API (localStorage)
// ========================================

export const children = {
  getAll: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    const children = data ? JSON.parse(data) : [];
    return { success: true, data: children };
  },

  create: async (childData) => {
    const children = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHILDREN) || '[]');
    const newChild = {
      id: generateId(),
      childId: generateId(),
      ...childData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    children.push(newChild);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
    return { success: true, data: newChild };
  },

  update: async (id, updates) => {
    const children = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHILDREN) || '[]');
    const index = children.findIndex(c => c.id === id || c.childId === id);
    if (index === -1) throw new Error('Child not found');

    children[index] = {
      ...children[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
    return { success: true, data: children[index] };
  },

  delete: async (id) => {
    const children = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHILDREN) || '[]');
    const filtered = children.filter(c => c.id !== id && c.childId !== id);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(filtered));
    return { success: true };
  },
};

// ========================================
// SONGS API (localStorage + Serverless)
// ========================================

export const songs = {
  /**
   * Generate song using serverless functions
   */
  generate: async (songData) => {
    try {
      const { childIds, topic, category, style, customDetails } = songData;

      // Get child data
      const childrenData = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHILDREN) || '[]');
      const child = childrenData.find(c => childIds.includes(c.id) || childIds.includes(c.childId));

      if (!child) {
        throw new Error('Child not found');
      }

      console.log('🎵 Step 1: Generating prompt with Gemini...');

      // Step 1: Generate prompt (calls Gemini via serverless function)
      const promptResponse = await axios.post(`${API_BASE}/generate-prompt`, {
        childName: child.name,
        childAge: child.age,
        topic,
        category,
        style,
        customDetails,
      });

      if (!promptResponse.data.success) {
        throw new Error('Failed to generate prompt');
      }

      const { title, lyrics, styleDescription } = promptResponse.data.data;

      console.log('✅ Prompt generated:', title);
      console.log('🎵 Step 2: Sending to PiAPI for song generation...');

      // Step 2: Generate song (calls PiAPI via serverless function)
      const songResponse = await axios.post(`${API_BASE}/generate-song`, {
        styleDescription,
        lyrics,
        title,
      });

      if (!songResponse.data.success) {
        throw new Error('Failed to start song generation');
      }

      const { taskId, status } = songResponse.data.data;

      console.log('✅ Song generation started. Task ID:', taskId);

      // Step 3: Save song to localStorage
      const songsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SONGS) || '[]');
      const newSong = {
        id: generateId(),
        songId: generateId(),
        taskId,
        childIds,
        title,
        lyrics,
        styleDescription,
        topic,
        category,
        style: style || 'lullaby',
        customDetails: customDetails || '',
        status,
        isFavorite: false,
        playCount: 0,
        audioUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      songsData.unshift(newSong);
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songsData));

      return {
        success: true,
        data: {
          songId: newSong.id,
          status: 'generating',
          estimatedTime: 60,
        },
      };

    } catch (error) {
      console.error('Generate song error:', error);
      throw error;
    }
  },

  /**
   * Get all songs from localStorage
   */
  getAll: async (filters = {}) => {
    let songsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SONGS) || '[]');

    // Apply filters
    if (filters.childId) {
      songsData = songsData.filter(s =>
        (s.childIds || []).includes(filters.childId)
      );
    }

    if (filters.status) {
      songsData = songsData.filter(s => s.status === filters.status);
    }

    if (filters.isFavorite) {
      songsData = songsData.filter(s => s.isFavorite === true);
    }

    return { success: true, data: songsData };
  },

  /**
   * Check song status (calls serverless function)
   */
  getStatus: async (songId) => {
    try {
      // Get song from localStorage
      const songsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SONGS) || '[]');
      const song = songsData.find(s => s.id === songId || s.songId === songId);

      if (!song) {
        throw new Error('Song not found');
      }

      if (song.status === 'completed') {
        return { success: true, data: song };
      }

      if (!song.taskId) {
        return { success: true, data: song };
      }

      console.log('🔍 Checking status for task:', song.taskId);

      // Check status via serverless function
      const response = await axios.get(`${API_BASE}/check-status`, {
        params: { taskId: song.taskId },
      });

      if (!response.data.success) {
        throw new Error('Failed to check status');
      }

      const statusData = response.data.data;

      // Update song in localStorage
      const songIndex = songsData.findIndex(s => s.id === songId || s.songId === songId);
      if (songIndex !== -1) {
        songsData[songIndex] = {
          ...songsData[songIndex],
          status: statusData.status,
          audioUrl: statusData.audioUrl || songsData[songIndex].audioUrl,
          lyrics: statusData.lyrics || songsData[songIndex].lyrics,
          duration: statusData.duration || songsData[songIndex].duration,
          coverUrl: statusData.coverUrl || songsData[songIndex].coverUrl,
          metadata: statusData.metadata || songsData[songIndex].metadata,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songsData));
      }

      return { success: true, data: songsData[songIndex] };

    } catch (error) {
      console.error('Get status error:', error);
      throw error;
    }
  },

  /**
   * Toggle favorite
   */
  toggleFavorite: async (songId) => {
    const songsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SONGS) || '[]');
    const index = songsData.findIndex(s => s.id === songId || s.songId === songId);

    if (index === -1) {
      throw new Error('Song not found');
    }

    songsData[index].isFavorite = !songsData[index].isFavorite;
    songsData[index].updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songsData));

    return { success: true, data: songsData[index] };
  },

  /**
   * Delete song
   */
  delete: async (songId) => {
    const songsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SONGS) || '[]');
    const filtered = songsData.filter(s => s.id !== songId && s.songId !== songId);
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(filtered));
    return { success: true };
  },
};

// ========================================
// USER API (localStorage)
// ========================================

export const users = {
  getProfile: async () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) {
      // Create default guest user
      const defaultUser = {
        id: generateId(),
        name: 'Guest User',
        email: 'guest@babysu.app',
        subscriptionTier: 'free',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
      return { success: true, data: defaultUser };
    }
    return { success: true, data: JSON.parse(userData) };
  },

  getUsage: async () => {
    const songsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SONGS) || '[]');
    const completedCount = songsData.filter(s => s.status === 'completed').length;

    return {
      success: true,
      data: {
        songsGenerated: songsData.length,
        songsThisMonth: completedCount,
        limit: 999, // Unlimited for local-only version
      },
    };
  },
};

// ========================================
// AUTH API (Backend + localStorage)
// ========================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const auth = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('userToken', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.removeItem('guestMode');

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (email, password, name) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
      });

      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('userToken', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.removeItem('guestMode');

      return { user, token };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('userToken');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data.user || response.data;

      // Update localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      // Clear invalid token
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      throw error;
    }
  },

  loginAsGuest: async () => {
    const guestUser = {
      id: generateId(),
      name: 'Guest User',
      email: 'guest@babysu.app',
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guestUser));
    localStorage.setItem('guestMode', 'true');
    return { success: true, user: guestUser, token: 'guest-token' };
  },

  logout: async () => {
    localStorage.removeItem('guestMode');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem(STORAGE_KEYS.USER);
    return { success: true };
  },
};
