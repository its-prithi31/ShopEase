import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Determining the API URL for different environments:
 * - Web / iOS Simulator: http://localhost:5000/api
 * - Android Emulator: http://10.0.2.2:5000/api (special loopback alias)
 * - Physical Device (Expo Go): Replace with your computer's local IP (e.g., http://10.66.106.119:5000/api)
 */
const getWebBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const DEFAULT_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  web: getWebBaseUrl(),
  default: 'http://localhost:5000/api',
});

export const BASE_API_URL = DEFAULT_URL;

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token to every request if available
api.interceptors.request.use(
  async (config) => {
    try {
      const customUrl = await AsyncStorage.getItem('@shopease_custom_api_url');
      if (customUrl) {
        config.baseURL = customUrl;
      }

      const token = await AsyncStorage.getItem('@shopease_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error reading token from AsyncStorage:', error);
    }

    // Strip leading slash if url starts with '/' so Axios does not discard the baseURL subpath (e.g., /api)
    if (config.url && config.url.startsWith('/') && !config.url.startsWith('/api') && !config.url.startsWith('/.netlify')) {
      config.url = config.url.replace(/^\/+/, '');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error format and auto-fallback to direct Netlify Functions
api.interceptors.response.use(
  (response) => {
    // Safety guard: if an SPA route returns the HTML index.html instead of JSON data
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
      const err = new Error('API returned HTML page instead of JSON');
      err.response = { status: 404, data: { message: 'API returned HTML page instead of JSON' } };
      throw err;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      typeof window !== 'undefined' &&
      originalRequest &&
      !originalRequest._retry &&
      (!error.response || error.response.status === 404) &&
      !originalRequest.baseURL?.includes('/.netlify/functions')
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = `${window.location.origin}/.netlify/functions/api`;
      try {
        return await api(originalRequest);
      } catch (retryError) {
        error = retryError;
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Network request failed. Please ensure the backend server is running.';
    return Promise.reject(new Error(message));
  }
);

export default api;
