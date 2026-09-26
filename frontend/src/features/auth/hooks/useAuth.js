import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';

export function useAuth() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const addToast = useUiStore((state) => state.addToast);

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession(data);
      addToast({ title: 'Welcome back', message: `Signed in as ${data.user.name}` });
      navigate('/dashboard');
    },
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearSession();
      navigate('/login');
    },
  });

  return { login, logout };
}
