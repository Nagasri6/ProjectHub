import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../schemas/projectSchema';
import { Input, Textarea, Select } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { PROJECT_STATUSES } from '../../../lib/status';

export function ProjectForm({ defaultValues, users = [], onSubmit, onCancel, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'Planning',
      category: 'Product',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 12 }}>
      <Input label="Project Name" error={errors.name?.message} {...register('name')} />
      <Textarea label="Description" error={errors.description?.message} {...register('description')} />
      <Select label="Owner" error={errors.owner?.message} {...register('owner')}>
        <option value="">Select owner</option>
        {users.map((user) => (
          <option key={user.id || user._id} value={user.id || user._id}>
            {user.name}
          </option>
        ))}
      </Select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate')} />
        <Input label="Target Date" type="date" error={errors.targetDate?.message} {...register('targetDate')} />
      </div>
      <Select label="Status" {...register('status')}>
        {PROJECT_STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </Select>
      <Input label="Category" {...register('category')} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save project'}
        </Button>
      </div>
    </form>
  );
}
