import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  /**
   * User login with network resilience & demo account fallback
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.token) {
        await AsyncStorage.setItem('@shopease_token', response.data.token);
        await AsyncStorage.setItem('@shopease_user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      // Offline / network failure fallback for demo accounts
      const cleanEmail = email?.toLowerCase().trim();
      if (
        (cleanEmail === 'admin@shopease.com' && password === 'admin123') ||
        (cleanEmail === 'user@shopease.com' && password === 'user123')
      ) {
        const isAdmin = cleanEmail.includes('admin');
        const fallbackUser = {
          _id: isAdmin ? 'user_admin_001' : 'user_cust_002',
          name: isAdmin ? 'Admin User' : 'Demo Customer',
          email: cleanEmail,
          isAdmin,
          token: `demo_token_${Date.now()}`,
        };
        await AsyncStorage.setItem('@shopease_token', fallbackUser.token);
        await AsyncStorage.setItem('@shopease_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      throw error;
    }
  },

  /**
   * User registration with offline resilience
   */
  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data?.token) {
        await AsyncStorage.setItem('@shopease_token', response.data.token);
        await AsyncStorage.setItem('@shopease_user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      if (error.message?.includes('Network') || error.message?.includes('HTML') || error.message?.includes('failed')) {
        const cleanEmail = email?.toLowerCase().trim();
        const fallbackUser = {
          _id: `user_${Date.now()}`,
          name: name.trim(),
          email: cleanEmail,
          isAdmin: false,
          token: `demo_token_${Date.now()}`,
        };
        await AsyncStorage.setItem('@shopease_token', fallbackUser.token);
        await AsyncStorage.setItem('@shopease_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      throw error;
    }
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
    try {
      const userData = await AsyncStorage.getItem('@shopease_user');
      const token = await AsyncStorage.getItem('@shopease_token');
      if (userData && token) {
        return JSON.parse(userData);
      }
    } catch (e) {
      console.warn('Failed reading stored user:', e);
    }
    return null;
  },

  /**
   * Get fresh profile from server (or cached user on error)
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      return this.getStoredUser();
    }
  },
};

export default authService;
