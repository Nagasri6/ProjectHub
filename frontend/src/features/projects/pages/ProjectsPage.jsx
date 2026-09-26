import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, ProgressBar } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SearchInput, Select } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Modal, ConfirmDialog } from '../../../components/ui/Modal';
import { Pagination } from '../../../components/ui/Table';
import { EmptyState, ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { useProjects, useProjectMutations } from '../hooks/useProjects';
import { ProjectForm } from '../components/ProjectForm';
import { teamApi } from '../../team/api/teamApi';
import { usePermissions } from '../../../hooks/usePermissions';
import { usePagination } from '../../../hooks/usePagination';
import { projectStatusVariant, PROJECT_STATUSES } from '../../../lib/status';
import { formatDate } from '../../../lib/format';
import styles from '../../dashboard/pages/dashboard.module.css';

export function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState('');
  const { page, setPage } = usePagination();
  const { hasPermission } = usePermissions();
  const { data, isLoading, isError, refetch } = useProjects({ search, status, owner, page, limit: 8 });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => teamApi.listUsers({ limit: 50 }) });
  const { create, update, remove } = useProjectMutations();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get('create') === '1') setOpen(true);
  }, [params]);

  const closeForm = () => {
    setOpen(false);
    setEditing(null);
    params.delete('create');
    setParams(params);
  };

  if (isLoading) return <Skeleton height={360} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Create, filter, and open the workspaces your team is shipping."
        actions={
          hasPermission('project:create') ? (
            <Button onClick={() => setOpen(true)}>Create project</Button>
          ) : null
        }
      />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search projects" />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((item) => <option key={item}>{item}</option>)}
        </Select>
        <Select value={owner} onChange={(e) => { setOwner(e.target.value); setPage(1); }}>
          <option value="">All owners</option>
          {(users?.items || []).map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </Select>
      </div>

      {!data.items.length ? (
        <Card>
          <EmptyState title="No projects found" message="There are no projects matching your filters." actionLabel="Clear filters" onAction={() => { setSearch(''); setStatus(''); setOwner(''); }} />
        </Card>
      ) : (
        <div className="page-grid">
          {data.items.map((project) => (
            <Card key={project._id}>
              <div className={styles.row} style={{ border: 0, padding: 0 }}>
                <div className={styles.mark} style={{ background: project.color }}>{project.name[0]}</div>
                <div className={styles.grow}>
                  <Link to={`/projects/${project._id}`} style={{ fontWeight: 700, fontSize: 18 }}>{project.name}</Link>
                  <div className={styles.muted}>{project.description}</div>
                </div>
                <Badge variant={projectStatusVariant[project.status]}>{project.status}</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                <ProgressBar value={project.progress} />
                <strong>{project.progress}%</strong>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar name={project.owner?.name} src={project.owner?.avatar} size="sm" /> {project.owner?.name}
                </span>
                <span>{project.taskCount} tasks</span>
                <span>{project.memberCount} members</span>
                <span>Due {formatDate(project.targetDate)}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Link to={`/projects/${project._id}`}><Button size="sm" variant="soft">Open</Button></Link>
                {hasPermission('project:edit') ? <Button size="sm" variant="secondary" onClick={() => setEditing(project)}>Edit</Button> : null}
                {hasPermission('project:delete') ? <Button size="sm" variant="danger" onClick={() => setDeleting(project)}>Delete</Button> : null}
              </div>
            </Card>
          ))}
          <Pagination page={data.page} pages={data.pages} onPage={setPage} />
        </div>
      )}

      <Modal open={open || Boolean(editing)} title={editing ? 'Edit project' : 'Create project'} onClose={closeForm}>
        <ProjectForm
          users={users?.items || []}
          defaultValues={editing ? { ...editing, owner: editing.owner?._id || editing.owner, startDate: editing.startDate?.slice(0, 10), targetDate: editing.targetDate?.slice(0, 10) } : undefined}
          loading={create.isPending || update.isPending}
          onCancel={closeForm}
          onSubmit={(values) => {
            if (editing) update.mutate({ id: editing._id, payload: values }, { onSuccess: closeForm });
            else create.mutate(values, { onSuccess: closeForm });
          }}
        />
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Project?"
        message="This action cannot be undone."
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting._id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
