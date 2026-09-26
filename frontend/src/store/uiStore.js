import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  theme: localStorage.getItem('projecthub_theme') || 'light',
  toasts: [],
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => {
    localStorage.setItem('projecthub_theme', theme);
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));
