import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { isToday, isPast, isFuture } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useMyTasks, useTaskMutations } from '../hooks/useTasks';
import { useProjects } from '../../projects/hooks/useProjects';
import { teamApi } from '../../team/api/teamApi';
import { TaskForm } from '../components/TaskForm';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { SearchInput, Select } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState, ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { priorityVariant, TASK_STATUSES, TASK_PRIORITIES } from '../../../lib/status';
import { formatDue } from '../../../lib/format';

export function MyTasksPage() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [open, setOpen] = useState(false);
  const { data: tasks = [], isLoading, isError, refetch } = useMyTasks({ search, status, priority });
  const { data: projects } = useProjects({ limit: 50 });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => teamApi.listUsers({ limit: 50 }) });
  const { create, update } = useTaskMutations();

  useEffect(() => {
    if (params.get('create') === '1') setOpen(true);
  }, [params]);

  const groups = useMemo(() => {
    const today = [];
    const upcoming = [];
    const overdue = [];
    const completed = [];
    tasks.forEach((task) => {
      if (task.status === 'Done') completed.push(task);
      else if (task.dueDate && isToday(new Date(task.dueDate))) today.push(task);
      else if (task.dueDate && isPast(new Date(task.dueDate))) overdue.push(task);
      else if (!task.dueDate || isFuture(new Date(task.dueDate))) upcoming.push(task);
    });
    return { today, upcoming, overdue, completed };
  }, [tasks]);

  if (isLoading) return <Skeleton height={320} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle="Work assigned to you, grouped by when it is due."
        actions={<Button onClick={() => setOpen(true)}>Create task</Button>}
      />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search my tasks" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((item) => <option key={item}>{item}</option>)}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((item) => <option key={item}>{item}</option>)}
        </Select>
      </div>
      {!tasks.length ? (
        <Card>
          <EmptyState title="No tasks assigned" message="When someone assigns you work, it will show up here." />
        </Card>
      ) : (
        <div className="page-grid">
          <TaskGroup title="Today" items={groups.today} onStatus={(task, next) => update.mutate({ id: task._id, payload: { status: next } })} />
          <TaskGroup title="Upcoming" items={groups.upcoming} onStatus={(task, next) => update.mutate({ id: task._id, payload: { status: next } })} />
          <TaskGroup title="Overdue" items={groups.overdue} onStatus={(task, next) => update.mutate({ id: task._id, payload: { status: next } })} />
          <TaskGroup title="Completed" items={groups.completed} onStatus={(task, next) => update.mutate({ id: task._id, payload: { status: next } })} />
        </div>
      )}
      <Modal open={open} title="Create task" onClose={() => setOpen(false)}>
        <TaskForm
          projects={projects?.items || []}
          users={users?.items || []}
          loading={create.isPending}
          onCancel={() => setOpen(false)}
          onSubmit={(values) => create.mutate(values, { onSuccess: () => setOpen(false) })}
        />
      </Modal>
    </div>
  );
}

function TaskGroup({ title, items, onStatus }) {
  return (
    <Card>
      <CardHeader title={`${title} (${items.length})`} />
      {!items.length ? <p style={{ color: 'var(--color-text-muted)' }}>Nothing here right now.</p> : null}
      {items.map((task) => (
        <div key={task._id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ flex: 1 }}>
            <Link to={`/tasks/${task._id}`} style={{ fontWeight: 600 }}>{task.title}</Link>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{task.project?.name}</div>
          </div>
          <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
          <span style={{ fontSize: 13 }}>{formatDue(task.dueDate)}</span>
          <Select value={task.status} onChange={(e) => onStatus(task, e.target.value)}>
            {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </Select>
        </div>
      ))}
    </Card>
  );
}
