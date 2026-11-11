import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('demuna_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('demuna_token') || localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await apiClient.get(ENDPOINTS.ME);
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('demuna_user', JSON.stringify(res.data.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (identifier, password, roleId = null) => {
    const payload = {
      email: identifier,
      dni: identifier,
      username: identifier,
      password,
      ...(roleId ? { roleId: parseInt(roleId, 10) } : {})
    };
    const res = await apiClient.post(ENDPOINTS.LOGIN, payload);
    if (res.data?.success && res.data?.data) {
      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('demuna_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('demuna_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: res.data?.message || 'Error al iniciar sesión' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('demuna_token');
    localStorage.removeItem('token');
    localStorage.removeItem('demuna_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: true,
      isAuthenticated: false,
      login: async () => ({ success: false }),
      logout: () => {}
    };
  }
  return context;
};

