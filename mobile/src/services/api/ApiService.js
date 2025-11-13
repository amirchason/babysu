/**
 * ApiService.js
 * Main API client for BabySu backend
 */

import axios from 'axios';

// Use environment variable or fallback to localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log('[ApiService] Request:', config.method.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('[ApiService] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log('[ApiService] Response:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('[ApiService] Response error:', error.response?.status, error.message);

        // Handle specific error cases
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;

          if (status === 401) {
            console.error('[ApiService] Unauthorized');
          } else if (status === 404) {
            console.error('[ApiService] Not found');
          } else if (status === 500) {
            console.error('[ApiService] Server error');
          }

          throw new Error(data?.message || data?.error || `API Error: ${status}`);
        } else if (error.request) {
          // Request made but no response
          console.error('[ApiService] No response from server');
          throw new Error('Network error - please check your connection');
        } else {
          // Something else happened
          throw new Error(error.message || 'Unknown error');
        }
      }
    );
  }

  /**
   * Generic GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`[ApiService] GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Generic POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`[ApiService] POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Generic PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   */
  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`[ApiService] PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Generic DELETE request
   * @param {string} endpoint - API endpoint
   */
  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`[ApiService] DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Check API health
   */
  async healthCheck() {
    try {
      const response = await this.get('/health');
      console.log('[ApiService] Health check:', response);
      return response;
    } catch (error) {
      console.error('[ApiService] Health check failed:', error);
      throw error;
    }
  }

  /**
   * Set base URL
   * @param {string} url - New base URL
   */
  setBaseURL(url) {
    this.client.defaults.baseURL = url;
    console.log('[ApiService] Base URL set to:', url);
  }

  /**
   * Get base URL
   */
  getBaseURL() {
    return this.client.defaults.baseURL;
  }
}

// Export singleton instance
export default new ApiService();
