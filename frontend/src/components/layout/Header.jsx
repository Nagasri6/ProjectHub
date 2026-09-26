import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, CircleHelp, Menu, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useDebounce } from '../../hooks/useDebounce';
import { searchApi } from '../../features/search/api/searchApi';
import { notificationApi } from '../../features/notifications/api/notificationApi';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/Button';
import { greeting, firstName, formatRelative } from '../../lib/format';
import styles from './layout.module.css';

const titles = {
  '/dashboard': {
    title: (user) => `${greeting()}, ${firstName(user?.name)} 👋`,
    subtitle: "Here's what's happening with your projects today.",
  },
};

export function Header() {
  const user = useAuthStore((state) => state.user);
  const openSidebar = useUiStore((state) => state.openSidebar);
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const debounced = useDebounce(query, 300);
  const boxRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: results } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchApi.search(debounced),
    enabled: debounced.length > 1,
  });

  const { data: notes } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.list,
  });

  const markAll = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOne = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const onClick = (event) => {
      if (!boxRef.current?.contains(event.target)) {
        setOpenSearch(false);
        setOpenNotes(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const heading = titles[location.pathname] || {
    title: () => prettyTitle(location.pathname),
    subtitle: 'Stay aligned with your team and project work.',
  };

  return (
    <header className={styles.header} ref={boxRef}>
      <div className={styles.greeting}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconButton className={styles.menuBtn} aria-label="Open navigation" onClick={openSidebar}>
            <Menu size={20} />
          </IconButton>
          <h1>{heading.title(user)}</h1>
        </div>
        <p>{heading.subtitle}</p>
      </div>

      <div className={styles.searchWrap}>
        <label className={styles.searchBox}>
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpenSearch(true);
            }}
            onFocus={() => setOpenSearch(true)}
            placeholder="Search projects, tasks, people..."
          />
        </label>
        {openSearch && debounced.length > 1 ? (
          <div className={styles.results}>
            <SearchGroup title="Projects" items={results?.projects} to={(item) => `/projects/${item._id}`} label={(item) => item.name} />
            <SearchGroup title="Tasks" items={results?.tasks} to={(item) => `/tasks/${item._id}`} label={(item) => item.title} />
            <SearchGroup title="People" items={results?.users} to={() => '/team'} label={(item) => item.name} />
            <SearchGroup title="Issues" items={results?.issues} to={(item) => `/projects/${item.project?._id || item.project}/issues`} label={(item) => item.title} />
            <SearchGroup title="Files" items={results?.files} to={(item) => `/projects/${item.project?._id || item.project}/files`} label={(item) => item.originalName} />
            {!results?.projects?.length && !results?.tasks?.length && !results?.users?.length && !results?.issues?.length && !results?.files?.length ? (
              <div style={{ padding: 12, color: 'var(--color-text-muted)' }}>No matches for “{debounced}”</div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={styles.utils}>
        <div style={{ position: 'relative' }}>
          <IconButton aria-label="Notifications" badge={Boolean(notes?.unread)} onClick={() => setOpenNotes((value) => !value)}>
            <Bell size={20} />
          </IconButton>
          {openNotes ? (
            <div className={styles.dropdown}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8 }}>
                <strong>Notifications</strong>
                <button type="button" className={styles.resultItem} onClick={() => markAll.mutate()} style={{ border: 0, background: 'none', color: 'var(--color-primary)' }}>
                  Mark all as read
                </button>
              </div>
              {(notes?.items || []).map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className={styles.resultItem}
                  style={{ width: '100%', textAlign: 'left', border: 0, background: item.read ? 'transparent' : 'var(--color-primary-soft)' }}
                  onClick={() => markOne.mutate(item._id)}
                >
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {item.body} · {formatRelative(item.createdAt)}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <IconButton aria-label="Help" title="Need help? Use the in-app workflow from Dashboard to Reports.">
          <CircleHelp size={20} />
        </IconButton>
        <div className={styles.profile}>
          <Avatar name={user?.name} src={user?.avatar} />
          <div className={styles.profileText}>
            <div className={styles.profileName}>{user?.name}</div>
            <div className={styles.profileRole}>{user?.title}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchGroup({ title, items, to, label }) {
  if (!items?.length) return null;
  return (
    <>
      <div className={styles.resultGroup}>{title}</div>
      {items.map((item) => (
        <Link key={item._id} className={styles.resultItem} to={to(item)}>
          {label(item)}
        </Link>
      ))}
    </>
  );
}

function prettyTitle(pathname) {
  const map = {
    '/projects': 'Projects',
    '/my-tasks': 'My Tasks',
    '/team': 'Team',
    '/timeline': 'Timeline',
    '/calendar': 'Calendar',
    '/files': 'Files',
    '/issues': 'Issues',
    '/activity': 'Activity',
    '/reports': 'Reports',
    '/workload': 'Workload',
    '/settings': 'Settings',
    '/profile': 'Profile',
  };
  return map[pathname] || 'ProjectHub';
}
