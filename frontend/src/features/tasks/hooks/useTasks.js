import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { useUiStore } from '../../../store/uiStore';

export function useProjectTasks(projectId) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskApi.listByProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useMyTasks(params) {
  return useQuery({
    queryKey: ['my-tasks', params],
    queryFn: () => taskApi.mine(params),
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskApi.get(id),
    enabled: Boolean(id),
  });
}

export function useTaskMutations(projectId) {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    queryClient.invalidateQueries({ queryKey: ['task'] });
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
  };

  const create = useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      invalidate();
      addToast({ title: 'Task created successfully.' });
    },
    onError: (error) => addToast({ title: 'Unable to create the task.', message: error.message }),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => taskApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = queryClient.getQueryData(['tasks', projectId]);
      queryClient.setQueryData(['tasks', projectId], (current = []) =>
        current.map((task) => (task._id === id || task.id === id ? { ...task, ...payload } : task)),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks', projectId], context.previous);
      addToast({ title: 'Unable to update the task.', message: error.message });
    },
    onSuccess: () => addToast({ title: 'Task updated successfully.' }),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: taskApi.remove,
    onSuccess: () => {
      invalidate();
      addToast({ title: 'Task deleted.' });
    },
    onError: (error) => addToast({ title: 'Unable to delete the task.', message: error.message }),
  });

  return { create, update, remove };
}
