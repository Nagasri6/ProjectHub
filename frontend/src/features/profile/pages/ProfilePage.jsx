import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../auth/api/authApi';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  timezone: z.string().min(2, 'Timezone is required'),
  title: z.string().optional(),
  avatar: z.string().url('Enter a valid image URL').or(z.literal('')).optional(),
});

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const permissions = useAuthStore((state) => state.permissions);
  const addToast = useUiStore((state) => state.addToast);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name, timezone: user?.timezone, title: user?.title, avatar: user?.avatar || '' },
  });

  const mutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      setSession({ user: data.user, permissions });
      addToast({ title: 'Profile updated successfully.' });
    },
    onError: (error) => addToast({ title: 'Unable to update profile', message: error.message }),
  });

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your public identity inside ProjectHub." />
      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <Avatar name={user?.name} src={form.watch('avatar') || user?.avatar} size="lg" />
          <div>
            <strong>{user?.name}</strong>
            <div style={{ color: 'var(--color-text-muted)' }}>{user?.email} · {user?.role}</div>
          </div>
        </div>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          <Input label="Name" error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input label="Title" {...form.register('title')} />
          <Input label="Email" value={user?.email} disabled />
          <Input label="Role" value={user?.role} disabled />
          <Input label="Profile image URL" error={form.formState.errors.avatar?.message} {...form.register('avatar')} />
          <Input label="Timezone" error={form.formState.errors.timezone?.message} {...form.register('timezone')} />
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save profile'}</Button>
        </form>
      </Card>
    </div>
  );
}
