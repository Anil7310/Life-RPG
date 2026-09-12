import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [levelUpData, setLevelUpData] = useState(null);

  const applyTheme = (themeName) => {
    if (!themeName) return;
    document.documentElement.setAttribute('data-theme', themeName);
  };

  const fetchCurrentUser = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        applyTheme(data.user.activeTheme || 'pastel-clay');
      } else {
        api.setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Auto auth check failed:', err.message);
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    if (data.success && data.token) {
      api.setToken(data.token);
      setUser(data.user);
      applyTheme(data.user.activeTheme || 'pastel-clay');
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (formData) => {
    const data = await api.register(formData);
    if (data.success && data.token) {
      api.setToken(data.token);
      setUser(data.user);
      applyTheme(data.user.activeTheme || 'pastel-clay');
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const guestLogin = async () => {
    const data = await api.guestLogin();
    if (data.success && data.token) {
      api.setToken(data.token);
      setUser(data.user);
      applyTheme(data.user.activeTheme || 'pastel-clay');
      return data;
    }
    throw new Error(data.message || 'Guest login failed');
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    document.documentElement.removeAttribute('data-theme');
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser?.activeTheme) {
      applyTheme(updatedUser.activeTheme);
    }
  };

  const triggerLevelUp = (levelData) => {
    setLevelUpData(levelData);
  };

  const clearLevelUp = () => {
    setLevelUpData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        guestLogin,
        logout,
        updateUserState,
        fetchCurrentUser,
        levelUpData,
        triggerLevelUp,
        clearLevelUp,
        applyTheme
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
