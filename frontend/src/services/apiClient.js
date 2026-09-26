import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('projecthub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isLoginRequest(config) {
  const url = config?.url || '';
  return url.includes('/auth/login');
}

apiClient.interceptors.response.use(
  (response) => (response.config.rawResponse ? response : response.data),
  (error) => {
    const status = error.response?.status;
    if (status === 401 && !isLoginRequest(error.config)) {
      useAuthStore.getState().clearSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(Object.assign(new Error(message), { status, details: error.response?.data }));
  },
);
