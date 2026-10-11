import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Determining the API URL for different environments:
 * - Web / iOS Simulator: http://localhost:5000/api
 * - Android Emulator: http://10.0.2.2:5000/api (special loopback alias)
 * - Physical Device (Expo Go): Replace with your computer's local IP (e.g., http://10.66.106.119:5000/api)
 */
const DEFAULT_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api', // Web and desktop
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
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error format
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network request failed. Please ensure the backend server is running.';
    return Promise.reject(new Error(message));
  }
);

export default api;
