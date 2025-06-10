import axios, { AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        headers: config.headers,
      });
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

interface ErrorResponse {
  detail?: string | {
    type?: string;
    loc?: string[];
    msg?: string;
    input?: any;
  };
}

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (status === 401) {
      const store = useAuthStore.getState();
      store.logout();
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (status === 404) {
      if (detail && typeof detail === 'string' && detail.includes('Project not found')) {
        toast.error('The selected project no longer exists.');
      } else {
        toast.error('Resource not found.');
      }
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (detail) {
      // Handle both string and object error details
      if (typeof detail === 'string') {
        toast.error(detail);
      } else if (typeof detail === 'object') {
        toast.error(detail.msg || 'Validation error occurred.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } else {
      toast.error('An unexpected error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default api;