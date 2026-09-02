
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('yukti_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('yukti_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('yukti_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('yukti_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Auth token validation failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('yukti_token', res.token);
        localStorage.setItem('yukti_user', JSON.stringify(res.user));
        toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('yukti_token', res.token);
        localStorage.setItem('yukti_user', JSON.stringify(res.user));
        toast.success('Registration successful! Welcome to Yukti.');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('yukti_token');
    localStorage.removeItem('yukti_user');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('yukti_user', JSON.stringify(res.user));
        toast.success('Profile updated successfully');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Profile update failed');
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
      return { success: false, error: err.message };
    }
  };

  const seedDemoData = async () => {
    try {
      const res = await api.post('/seed/demo-data');
      if (res.success) {
        toast.success('Demo data populated with 5 full engineering courses!');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to populate demo data');
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      seedDemoData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
