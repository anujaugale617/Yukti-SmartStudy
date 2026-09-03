
import axios from 'axios';

// Render Backend API URL
const api = axios.create({
  baseURL: 'https://yukti-smartstudy.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yukti_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API responses and errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },

  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // If token is invalid/expired
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