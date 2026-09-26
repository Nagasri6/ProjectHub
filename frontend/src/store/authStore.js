import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  permissions: [],
  token: localStorage.getItem('projecthub_token'),
  status: 'idle',
  setSession: ({ user, permissions, token }) => {
    if (token) localStorage.setItem('projecthub_token', token);
    set({ user, permissions: permissions || [], token: token || get().token, status: 'ready' });
  },
  clearSession: () => {
    localStorage.removeItem('projecthub_token');
    set({ user: null, permissions: [], token: null, status: 'ready' });
  },
  setStatus: (status) => set({ status }),
  hasPermission: (permission) => get().permissions.includes(permission),
}));
