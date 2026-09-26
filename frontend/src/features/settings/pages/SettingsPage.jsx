import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../auth/api/authApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Switch } from '../../../components/ui/Switch';
import { Select } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';

const sections = [
  { to: '/settings', label: 'Profile', end: true },
  { to: '/profile', label: 'Account' },
];

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const permissions = useAuthStore((state) => state.permissions);
  const { theme, setTheme, addToast } = useUiStore();
  const { logout } = useAuth();
  const [settings, setSettings] = useState(user?.settings || {});

  const mutation = useMutation({
    mutationFn: authApi.updateSettings,
    onSuccess: (data) => {
      setSession({ user: data.user, permissions });
      addToast({ title: 'Settings saved.' });
    },
  });

  const update = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    mutation.mutate(next);
    if (key === 'theme') setTheme(value);
  };

  return (
    <div className="page-grid">
      <PageHeader title="Settings" subtitle="Notifications, appearance, and security preferences." />
      <Tabs items={sections} />
      <Card>
        <CardHeader title="Notifications" />
        <div style={{ display: 'grid', gap: 16 }}>
          <Switch label="Email notifications" checked={settings.emailNotifications} onChange={(value) => update('emailNotifications', value)} />
          <Switch label="Task notifications" checked={settings.taskNotifications} onChange={(value) => update('taskNotifications', value)} />
          <Switch label="Project notifications" checked={settings.projectNotifications} onChange={(value) => update('projectNotifications', value)} />
        </div>
      </Card>
      <Card>
        <CardHeader title="Appearance" />
        <Select label="Theme" value={theme} onChange={(e) => update('theme', e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
      </Card>
      <Card>
        <CardHeader title="Preferences" />
        <Select label="Timezone" value={settings.timezone || user?.timezone} onChange={(e) => update('timezone', e.target.value)}>
          <option value="Asia/Kolkata">Asia/Kolkata</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
        </Select>
      </Card>
      <Card>
        <CardHeader title="Security" />
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 12 }}>Sign out of this browser session.</p>
        <Button variant="danger" onClick={() => logout.mutate()}>Log out</Button>
      </Card>
    </div>
  );
}
