import { useAuthStore } from '../store/authStore';

export function usePermissions() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const role = useAuthStore((state) => state.user?.role);
  return { hasPermission, role, isAdmin: role === 'admin' };
}
