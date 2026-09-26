import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  GanttChart,
  CalendarDays,
  Files,
  AlertTriangle,
  Activity,
  BarChart3,
  Gauge,
  Settings,
  UserRound,
  Hexagon,
} from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { Switch } from '../ui/Switch';
import styles from './layout.module.css';

const sections = [
  {
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'WORKSPACE',
    items: [
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
      { to: '/team', label: 'Team', icon: Users },
      { to: '/timeline', label: 'Timeline', icon: GanttChart },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
      { to: '/files', label: 'Files', icon: Files },
      { to: '/issues', label: 'Issues', icon: AlertTriangle },
      { to: '/activity', label: 'Activity', icon: Activity },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/workload', label: 'Workload', icon: Gauge },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/profile', label: 'Profile', icon: UserRound },
    ],
  },
];

export function Sidebar() {
  const { sidebarOpen, closeSidebar, theme, setTheme } = useUiStore();

  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.brand}>
        <span className={styles.logo}>
          <Hexagon size={18} />
        </span>
        ProjectHub
      </div>
      <nav aria-label="Primary">
        {sections.map((section) => (
          <div key={section.title || 'top'}>
            {section.title ? <div className={styles.section}>{section.title}</div> : null}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
                  onClick={closeSidebar}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
      <div className={styles.footer}>
        <div className={styles.themeToggle}>
          <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          <Switch checked={theme === 'dark'} onChange={(on) => setTheme(on ? 'dark' : 'light')} />
        </div>
        <div className={styles.version}>ProjectHub v1.0.0</div>
      </div>
    </aside>
  );
}
