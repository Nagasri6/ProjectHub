import { useEffect } from 'react';
import { authApi } from '../../features/auth/api/authApi';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Spinner } from '../../components/feedback/Feedback';

export function AuthBootstrap({ children }) {
  const { status, setSession, clearSession, setStatus, token } = useAuthStore();
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!token) {
        setStatus('ready');
        return;
      }
      try {
        const data = await authApi.me();
        if (active) setSession(data);
      } catch {
        if (active) clearSession();
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [token, setSession, clearSession, setStatus]);

  if (status !== 'ready') {
    return <Spinner />;
  }

  return children;
}
