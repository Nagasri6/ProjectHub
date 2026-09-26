import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api/projectApi';
import { useUiStore } from '../../../store/uiStore';

export function useProjects(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectApi.list(params),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.get(id),
    enabled: Boolean(id),
  });
}

export function useProjectMutations() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => {
      invalidate();
      addToast({ title: 'Project created successfully.' });
    },
    onError: (error) => addToast({ title: 'Unable to create the project.', message: error.message }),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => projectApi.update(id, payload),
    onSuccess: () => {
      invalidate();
      addToast({ title: 'Project updated successfully.' });
    },
    onError: (error) => addToast({ title: 'Unable to update the project.', message: error.message }),
  });

  const remove = useMutation({
    mutationFn: projectApi.remove,
    onSuccess: () => {
      invalidate();
      addToast({ title: 'Project deleted.' });
    },
    onError: (error) => addToast({ title: 'Unable to delete the project.', message: error.message }),
  });

  return { create, update, remove };
}
