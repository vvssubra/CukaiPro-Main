import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { logger } from '../utils/logger';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storageKey = import.meta.env.VITE_AUTH_STORAGE_KEY || 'cukaipro_auth_token';

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem(storageKey);
        const userData = localStorage.getItem('cukaipro_user');

        if (token && userData) {
          setUser(JSON.parse(userData));
          logger.info('User loaded from storage');
        }
      } catch (err) {
        logger.error('Failed to load user from storage', err);
        localStorage.removeItem(storageKey);
        localStorage.removeItem('cukaipro_user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [storageKey]);

  const login = async (email) => {
    setLoading(true);
    setError(null);

    try {
      // Mock login - replace with actual API call
      logger.info('Attempting login for:', email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser = {
        id: '1',
        name: 'Azlan Shah',
        email: email,
        role: 'SME Founder',
      };

      const mockToken = 'mock_jwt_token_' + Date.now();

      // Store in localStorage
      localStorage.setItem(storageKey, mockToken);
      localStorage.setItem('cukaipro_user', JSON.stringify(mockUser));

      setUser(mockUser);
      logger.info('Login successful');

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      logger.error('Login failed:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem('cukaipro_user');
      setUser(null);
      logger.info('Logout successful');
    } catch (err) {
      logger.error('Logout failed:', err);
    }
  };

  const updateUser = (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('cukaipro_user', JSON.stringify(updatedUser));
      logger.info('User updated');
    } catch (err) {
      logger.error('Failed to update user:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
