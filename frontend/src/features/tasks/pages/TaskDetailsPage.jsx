import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTask, useTaskMutations } from '../hooks/useTasks';
import { taskApi } from '../api/taskApi';
import { commentSchema } from '../schemas/taskSchema';
import { teamApi } from '../../team/api/teamApi';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Select, Textarea, Input } from '../../../components/ui/Input';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { TASK_STATUSES, TASK_PRIORITIES, priorityVariant, taskStatusVariant } from '../../../lib/status';
import { formatDate, formatRelative } from '../../../lib/format';
import { useState } from 'react';

export function TaskDetailsPage() {
  const { taskId } = useParams();
  const { data: task, isLoading, isError, refetch } = useTask(taskId);
  const projectId = task?.project?._id || task?.project;
  const { update } = useTaskMutations(projectId);
  const queryClient = useQueryClient();
  const { data: team } = useQuery({
    queryKey: ['project-team', projectId],
    queryFn: () => teamApi.listProjectTeam(projectId),
    enabled: Boolean(projectId),
  });
  const [subtaskTitle, setSubtaskTitle] = useState('');

  const commentForm = useForm({ resolver: zodResolver(commentSchema) });
  const addComment = useMutation({
    mutationFn: (body) => taskApi.addComment(taskId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      commentForm.reset();
    },
  });

  if (isLoading) return <Skeleton height={360} />;
  if (isError || !task) return <ErrorState onRetry={refetch} />;

  const save = (payload) => update.mutate({ id: task._id, payload });

  return (
    <div className="page-grid">
      <Card>
        <Link to={projectId ? `/projects/${projectId}/tasks` : '/my-tasks'} style={{ color: 'var(--color-primary)', fontSize: 13 }}>← Back to tasks</Link>
        <h1 style={{ margin: '8px 0 8px', fontSize: 28 }}>{task.title}</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>{task.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Select label="Status" value={task.status} onChange={(e) => save({ status: e.target.value })}>
            {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </Select>
          <Select label="Priority" value={task.priority} onChange={(e) => save({ priority: e.target.value })}>
            {TASK_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
          </Select>
          <Select label="Assignee" value={task.assignee?._id || ''} onChange={(e) => save({ assignee: e.target.value })}>
            <option value="">Unassigned</option>
            {(team || []).map((member) => (
              <option key={member.user?._id} value={member.user?._id}>{member.user?.name}</option>
            ))}
          </Select>
          <Input label="Due date" type="date" defaultValue={task.dueDate?.slice(0, 10)} onBlur={(e) => save({ dueDate: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <Badge variant={taskStatusVariant[task.status]}>{task.status}</Badge>
          <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
          <span>Project: {task.project?.name}</span>
          <span>Created {formatDate(task.createdAt)}</span>
        </div>
      </Card>

      <Card>
        <CardHeader title="Subtasks" />
        {(task.subtasks || []).map((item) => (
          <label key={item._id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={() =>
                save({
                  subtasks: task.subtasks.map((sub) => (sub._id === item._id ? { ...sub, done: !sub.done } : sub)),
                })
              }
            />
            <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</span>
          </label>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Input value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="Add a subtask" />
          <Button
            type="button"
            onClick={() => {
              if (!subtaskTitle.trim()) return;
              save({ subtasks: [...(task.subtasks || []), { title: subtaskTitle, done: false }] });
              setSubtaskTitle('');
            }}
          >
            Add
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Comments" />
        {(task.comments || []).map((comment) => (
          <div key={comment._id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <Avatar name={comment.author?.name} src={comment.author?.avatar} size="sm" />
            <div>
              <strong>{comment.author?.name}</strong>
              <div>{comment.body}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatRelative(comment.createdAt)}</div>
            </div>
          </div>
        ))}
        <form onSubmit={commentForm.handleSubmit((values) => addComment.mutate(values.body))} style={{ display: 'grid', gap: 8 }}>
          <Textarea label="Add a comment" error={commentForm.formState.errors.body?.message} {...commentForm.register('body')} />
          <Button type="submit" disabled={addComment.isPending}>{addComment.isPending ? 'Posting...' : 'Comment'}</Button>
        </form>
      </Card>
    </div>
  );
}
