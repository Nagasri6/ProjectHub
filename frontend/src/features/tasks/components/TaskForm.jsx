import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '../schemas/taskSchema';
import { Input, Textarea, Select } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../lib/status';

export function TaskForm({ defaultValues, projects = [], users = [], onSubmit, onCancel, loading, lockProject }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'To Do',
      priority: 'Medium',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
      <Input label="Task title" error={errors.title?.message} {...register('title')} />
      <Textarea label="Description" {...register('description')} />
      <Select label="Project" error={errors.project?.message} disabled={lockProject} {...register('project')}>
        <option value="">Select project</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>{project.name}</option>
        ))}
      </Select>
      <Select label="Assignee" {...register('assignee')}>
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id || user._id} value={user.id || user._id}>{user.name}</option>
        ))}
      </Select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Status" {...register('status')}>
          {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
        </Select>
        <Select label="Priority" {...register('priority')}>
          {TASK_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
        </Select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Start date" type="date" {...register('startDate')} />
        <Input label="Due date" type="date" {...register('dueDate')} />
      </div>
      <Input label="Phase / label" {...register('phase')} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save task'}</Button>
      </div>
    </form>
  );
}
