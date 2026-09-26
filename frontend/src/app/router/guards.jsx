import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const user = useAuthStore((state) => state.user);
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function PermissionRoute({ permission }) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  if (!hasPermission(permission)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
