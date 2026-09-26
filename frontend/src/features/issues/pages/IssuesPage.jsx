import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { issueApi } from '../api/issueApi';
import { issueSchema } from '../schemas/issueSchema';
import { teamApi } from '../../team/api/teamApi';
import { useProjects } from '../../projects/hooks/useProjects';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal, ConfirmDialog } from '../../../components/ui/Modal';
import { Input, Textarea, Select, SearchInput } from '../../../components/ui/Input';
import { EmptyState, ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { ISSUE_PRIORITIES, ISSUE_STATUSES, issueStatusVariant, priorityVariant } from '../../../lib/status';
import { formatDate } from '../../../lib/format';
import { usePermissions } from '../../../hooks/usePermissions';
import { useUiStore } from '../../../store/uiStore';

export function ProjectIssuesPage() {
  const { project } = useOutletContext();
  return <IssuesManager projectId={project._id} />;
}

export function GlobalIssuesPage() {
  return <IssuesManager />;
}

function IssuesManager({ projectId }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const { hasPermission } = usePermissions();
  const { data: projects } = useProjects({ limit: 50 });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => teamApi.listUsers({ limit: 50 }) });

  useEffect(() => {
    if (params.get('create') === '1') setOpen(true);
  }, [params]);

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['issues', projectId, search, status, priority],
    queryFn: () => (projectId ? issueApi.listByProject(projectId, { search, status, priority }) : issueApi.listAll()),
  });

  const create = useMutation({
    mutationFn: issueApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      addToast({ title: 'Issue reported.' });
      setOpen(false);
    },
  });
  const update = useMutation({
    mutationFn: ({ id, payload }) => issueApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      addToast({ title: 'Issue updated successfully.' });
      setEditing(null);
    },
  });
  const remove = useMutation({
    mutationFn: issueApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setDeleting(null);
    },
  });

  if (isLoading) return <Skeleton height={280} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      {!projectId ? <PageHeader title="Issues" subtitle="Blockers and defects across your projects." actions={hasPermission('issue:create') ? <Button onClick={() => setOpen(true)}>Report issue</Button> : null} /> : (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>Issues</h2>
          {hasPermission('issue:create') ? <Button onClick={() => setOpen(true)}>Report issue</Button> : null}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search issues" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ISSUE_STATUSES.map((item) => <option key={item}>{item}</option>)}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {ISSUE_PRIORITIES.map((item) => <option key={item}>{item}</option>)}
        </Select>
      </div>
      <Card>
        {!data.length ? (
          <EmptyState title="No issues found" message="Nothing matches these filters." actionLabel="Clear filters" onAction={() => { setSearch(''); setStatus(''); setPriority(''); }} />
        ) : (
          <Table
            rows={data}
            columns={[
              { key: 'title', header: 'Title', render: (row) => <strong>{row.title}</strong> },
              { key: 'priority', header: 'Priority', render: (row) => <Badge variant={priorityVariant[row.priority]}>{row.priority}</Badge> },
              { key: 'status', header: 'Status', render: (row) => <Badge variant={issueStatusVariant[row.status]}>{row.status}</Badge> },
              { key: 'assignee', header: 'Assigned to', render: (row) => row.assignee?.name || 'Unassigned' },
              { key: 'dueDate', header: 'Due', render: (row) => formatDate(row.dueDate) },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>Edit</Button>
                    {hasPermission('issue:delete') ? <Button size="sm" variant="danger" onClick={() => setDeleting(row)}>Delete</Button> : null}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
      <IssueModal
        open={open || Boolean(editing)}
        title={editing ? 'Edit issue' : 'Report issue'}
        defaultValues={editing ? { ...editing, project: editing.project?._id || editing.project || projectId, assignee: editing.assignee?._id || '', dueDate: editing.dueDate?.slice(0, 10) } : { project: projectId, status: 'Open', priority: 'Medium' }}
        projects={projects?.items || []}
        users={users?.items || []}
        loading={create.isPending || update.isPending}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={(values) => (editing ? update.mutate({ id: editing._id, payload: values }) : create.mutate(values))}
      />
      <ConfirmDialog open={Boolean(deleting)} title="Delete issue?" message="This action cannot be undone." onClose={() => setDeleting(null)} onConfirm={() => remove.mutate(deleting._id)} />
    </div>
  );
}

function IssueModal({ open, title, defaultValues, projects, users, onSubmit, onClose, loading }) {
  const form = useForm({ resolver: zodResolver(issueSchema), values: defaultValues });
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
        <Input label="Title" error={form.formState.errors.title?.message} {...form.register('title')} />
        <Textarea label="Description" error={form.formState.errors.description?.message} {...form.register('description')} />
        <Select label="Project" {...form.register('project')}>
          <option value="">Select project</option>
          {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
        </Select>
        <Select label="Assigned to" {...form.register('assignee')}>
          <option value="">Unassigned</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </Select>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select label="Status" {...form.register('status')}>{ISSUE_STATUSES.map((item) => <option key={item}>{item}</option>)}</Select>
          <Select label="Priority" {...form.register('priority')}>{ISSUE_PRIORITIES.map((item) => <option key={item}>{item}</option>)}</Select>
        </div>
        <Input label="Due date" type="date" {...form.register('dueDate')} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save issue'}</Button>
        </div>
      </form>
    </Modal>
  );
}
