
import axios from 'axios';

// Dynamically use VITE_API_URL in production (e.g. on Vercel), fallback to '/api' in local dev (Vite proxy)
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Ensure it ends with /api
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yukti_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      if (
        window.location.pathname !== '/login' && 
        window.location.pathname !== '/register' && 
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('yukti_token');
        localStorage.removeItem('yukti_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
