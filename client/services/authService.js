import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  /**
   * User login
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      await AsyncStorage.setItem('@shopease_token', response.data.token);
      await AsyncStorage.setItem('@shopease_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * User registration
   */
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data?.token) {
      await AsyncStorage.setItem('@shopease_token', response.data.token);
      await AsyncStorage.setItem('@shopease_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * User logout
   */
  async logout() {
    await AsyncStorage.removeItem('@shopease_token');
    await AsyncStorage.removeItem('@shopease_user');
  },

  /**
   * Get current stored user session
   */
  async getStoredUser() {
    const userData = await AsyncStorage.getItem('@shopease_user');
    const token = await AsyncStorage.getItem('@shopease_token');
    if (userData && token) {
      return JSON.parse(userData);
    }
    return null;
  },

  /**
   * Get fresh profile from server
   */
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};
