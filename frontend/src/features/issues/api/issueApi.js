import { apiClient } from '../../../services/apiClient';

export const issueApi = {
  listByProject: (projectId, params) => apiClient.get(`/projects/${projectId}/issues`, { params }),
  listAll: () => apiClient.get('/issues'),
  create: (payload) => apiClient.post('/issues', payload),
  update: (id, payload) => apiClient.patch(`/issues/${id}`, payload),
  remove: (id) => apiClient.delete(`/issues/${id}`),
};
