import { apiClient } from '../../../services/apiClient';

export const taskApi = {
  listByProject: (projectId) => apiClient.get(`/projects/${projectId}/tasks`),
  mine: (params) => apiClient.get('/tasks/mine', { params }),
  get: (id) => apiClient.get(`/tasks/${id}`),
  create: (payload) => apiClient.post('/tasks', payload),
  update: (id, payload) => apiClient.patch(`/tasks/${id}`, payload),
  remove: (id) => apiClient.delete(`/tasks/${id}`),
  comments: (id) => apiClient.get(`/tasks/${id}/comments`),
  addComment: (id, body) => apiClient.post(`/tasks/${id}/comments`, { body }),
  deleteComment: (id) => apiClient.delete(`/comments/${id}`),
};
