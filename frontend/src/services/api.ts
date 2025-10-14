import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AUTH_STORAGE_KEYS } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (refreshResponse.data.success && refreshResponse.data.token) {
            // Update token
            localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, refreshResponse.data.token);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear auth data and redirect to login
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.request);
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
