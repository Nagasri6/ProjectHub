import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/dashboard'),
  });
}
