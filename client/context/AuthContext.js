import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore stored user session when app boots
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await authService.getStoredUser();
        if (stored) {
          setUser(stored);
        }
      } catch (error) {
        console.error('Session restore error:', error);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: !!user?.isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
