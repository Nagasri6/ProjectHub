import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUiStore } from '../../store/uiStore';

export function AppShell() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);

  return (
    <div className="app-shell">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.35)', border: 0, zIndex: 65 }}
        />
      ) : null}
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
