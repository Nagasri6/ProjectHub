import { apiClient } from '../../../services/apiClient';

export const notificationApi = {
  list: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};
