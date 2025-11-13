import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 seconds - faster failure when backend is offline
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['x-user-id'] = userId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      // Redirect to login (handled by router)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ======================
// AUTH ENDPOINTS
// ======================

export const auth = {
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
  },
};

// ======================
// CHILDREN ENDPOINTS
// ======================

export const children = {
  getAll: async () => {
    const response = await api.get('/children');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/children/${id}`);
    return response.data;
  },

  create: async (childData) => {
    const response = await api.post('/children', childData);
    return response.data;
  },

  update: async (id, childData) => {
    const response = await api.patch(`/children/${id}`, childData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/children/${id}`);
    return response.data;
  },
};

// ======================
// SONGS ENDPOINTS
// ======================

export const songs = {
  generate: async (songData) => {
    const response = await api.post('/songs/generate', songData);
    return response.data;
  },

  getAll: async (filters = {}) => {
    const response = await api.get('/songs', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/songs/${id}`);
    return response.data;
  },

  getStatus: async (id) => {
    const response = await api.get(`/songs/${id}/status`);
    return response.data;
  },

  toggleFavorite: async (id) => {
    const response = await api.patch(`/songs/${id}/favorite`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/songs/${id}`);
    return response.data;
  },
};

// ======================
// USER ENDPOINTS
// ======================

export const users = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getUsage: async () => {
    const response = await api.get('/users/usage');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.patch('/users/profile', userData);
    return response.data;
  },
};

export default api;
