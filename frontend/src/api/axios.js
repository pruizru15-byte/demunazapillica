import axios from 'axios';
import { API_BASE_URL } from './endpoints';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Interceptor de petición: inyecta Bearer token si existe
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['X-Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: detecta sesión expirada (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('demuna_token');
      localStorage.removeItem('token');
      localStorage.removeItem('demuna_user');
      const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
      const loginUrl = `${basePath}/login`;
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = loginUrl;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

