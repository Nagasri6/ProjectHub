import { apiClient } from '../../../services/apiClient';

export const searchApi = {
  search: (q) => apiClient.get('/search', { params: { q } }),
};
