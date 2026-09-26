import { apiClient } from '../../../services/apiClient';

export const authApi = {
  login: (payload) => apiClient.post('/auth/login', payload),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  updateProfile: (payload) => apiClient.patch('/auth/profile', payload),
  updateSettings: (payload) => apiClient.patch('/auth/settings', payload),
};
