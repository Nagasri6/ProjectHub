import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectTasks, useTaskMutations } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';
import { teamApi } from '../../team/api/teamApi';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Modal, ConfirmDialog } from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { TASK_STATUSES, priorityVariant } from '../../../lib/status';
import { formatDue } from '../../../lib/format';
import { usePermissions } from '../../../hooks/usePermissions';
import { MessageCircle, Paperclip } from 'lucide-react';

export function ProjectTasksPage() {
  const { project } = useOutletContext();
  const { data: tasks = [], isLoading, isError, refetch } = useProjectTasks(project._id);
  const { create, update, remove } = useTaskMutations(project._id);
  const { data: team } = useQuery({ queryKey: ['project-team', project._id], queryFn: () => teamApi.listProjectTeam(project._id) });
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (isLoading) return <Skeleton height={420} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const columns = TASK_STATUSES.map((status) => ({
    status,
    items: tasks.filter((task) => task.status === status),
  }));

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id;
    const nextStatus = over.data.current?.status || (TASK_STATUSES.includes(over.id) ? over.id : null);
    if (!nextStatus) return;
    const task = tasks.find((item) => item._id === taskId);
    if (task && TASK_STATUSES.includes(nextStatus) && task.status !== nextStatus) {
      update.mutate({ id: taskId, payload: { status: nextStatus } });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Task board</h2>
        {hasPermission('task:create') ? <Button onClick={() => setOpen(true)}>Create task</Button> : null}
      </div>
      {!tasks.length ? (
        <Card>
          <EmptyState title="No tasks yet" message="Create a task to start tracking project work." actionLabel="Create Task" onAction={() => setOpen(true)} />
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))', gap: 12, overflowX: 'auto' }}>
            {columns.map((column) => (
              <KanbanColumn key={column.status} column={column} />
            ))}
          </div>
        </DndContext>
      )}
      <Modal open={open} title="Create task" onClose={() => setOpen(false)}>
        <TaskForm
          lockProject
          projects={[project]}
          users={(team || []).map((member) => member.user).filter(Boolean)}
          defaultValues={{ project: project._id }}
          loading={create.isPending}
          onCancel={() => setOpen(false)}
          onSubmit={(values) => create.mutate(values, { onSuccess: () => setOpen(false) })}
        />
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Task?"
        message="This action cannot be undone."
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutate(deleting._id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}

function KanbanColumn({ column }) {
  const { setNodeRef } = useDroppable({ id: column.status, data: { status: column.status } });
  return (
    <div ref={setNodeRef} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: 12, minHeight: 360 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{column.status} · {column.items.length}</div>
      <SortableContext items={column.items.map((item) => item._id)} strategy={verticalListSortingStrategy}>
        {column.items.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}

function TaskCard({ task }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id, data: { status: task.status } });
  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: '#f8fafc',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        cursor: 'grab',
      }}
      onClick={() => navigate(`/tasks/${task._id}`)}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{task.title}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>{task.project?.name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
        <span style={{ fontSize: 12 }}>{formatDue(task.dueDate)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
        <Avatar name={task.assignee?.name} src={task.assignee?.avatar} size="sm" />
        <div style={{ display: 'flex', gap: 8, color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><MessageCircle size={14} />{task.subtasks?.length || 0}</span>
          <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Paperclip size={14} />{task.attachments?.length || 0}</span>
        </div>
      </div>
    </article>
  );
}
