import { apiClient } from '../../../services/apiClient';

export const projectApi = {
  list: (params) => apiClient.get('/projects', { params }),
  get: (id) => apiClient.get(`/projects/${id}`),
  create: (payload) => apiClient.post('/projects', payload),
  update: (id, payload) => apiClient.patch(`/projects/${id}`, payload),
  remove: (id) => apiClient.delete(`/projects/${id}`),
};
