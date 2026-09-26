import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '../api/teamApi';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Table, Pagination } from '../../../components/ui/Table';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { SearchInput, Select } from '../../../components/ui/Input';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { usePagination } from '../../../hooks/usePagination';

export function TeamPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const { page, setPage } = usePagination();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', { search, role, status, page }],
    queryFn: () => teamApi.listUsers({ search, role, status, page, limit: 8 }),
  });

  if (isLoading) return <Skeleton height={280} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Team" subtitle="Everyone with access to ProjectHub." />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search people" />
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="away">Away</option>
          <option value="offline">Offline</option>
        </Select>
      </div>
      <Card>
        <Table
          rows={data.items}
          rowKey="id"
          columns={[
            { key: 'name', header: 'Name', render: (row) => (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Avatar name={row.name} src={row.avatar} size="sm" />
                <div>
                  <div style={{ fontWeight: 600 }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{row.title}</div>
                </div>
              </div>
            ) },
            { key: 'role', header: 'Role', render: (row) => <Badge variant={row.role === 'admin' ? 'primary' : 'info'}>{row.role}</Badge> },
            { key: 'email', header: 'Email' },
            { key: 'projectCount', header: 'Projects' },
            { key: 'taskCount', header: 'Tasks' },
            { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</Badge> },
          ]}
        />
        <Pagination page={data.page} pages={data.pages} onPage={setPage} />
      </Card>
    </div>
  );
}
