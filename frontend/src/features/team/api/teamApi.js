import { apiClient } from '../../../services/apiClient';

export const teamApi = {
  listUsers: (params) => apiClient.get('/users', { params }),
  listProjectTeam: (projectId) => apiClient.get(`/projects/${projectId}/team`),
  addMember: (projectId, payload) => apiClient.post(`/projects/${projectId}/team`, payload),
  updateMember: (projectId, userId, payload) => apiClient.patch(`/projects/${projectId}/team/${userId}`, payload),
  removeMember: (projectId, userId) => apiClient.delete(`/projects/${projectId}/team/${userId}`),
};
