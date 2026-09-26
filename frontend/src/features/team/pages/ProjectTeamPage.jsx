import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../api/teamApi';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/ui/Table';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal, ConfirmDialog } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Input';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { usePermissions } from '../../../hooks/usePermissions';
import { useUiStore } from '../../../store/uiStore';

export function ProjectTeamPage() {
  const { project } = useOutletContext();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const addToast = useUiStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('Developer');
  const [removing, setRemoving] = useState(null);

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['project-team', project._id],
    queryFn: () => teamApi.listProjectTeam(project._id),
  });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => teamApi.listUsers({ limit: 50 }) });

  const add = useMutation({
    mutationFn: () => teamApi.addMember(project._id, { userId, projectRole: role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team', project._id] });
      addToast({ title: 'Team member added.' });
      setOpen(false);
    },
    onError: (error) => addToast({ title: 'Unable to add member', message: error.message }),
  });

  const remove = useMutation({
    mutationFn: (id) => teamApi.removeMember(project._id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team', project._id] });
      setRemoving(null);
    },
  });

  if (isLoading) return <Skeleton height={260} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Project team</h2>
        {hasPermission('team:manage') ? <Button onClick={() => setOpen(true)}>Add member</Button> : null}
      </div>
      <Card>
        <Table
          rows={data}
          rowKey="_id"
          columns={[
            { key: 'name', header: 'Name', render: (row) => (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Avatar name={row.user?.name} src={row.user?.avatar} size="sm" />
                {row.user?.name}
              </div>
            ) },
            { key: 'role', header: 'Role', render: (row) => row.projectRole },
            { key: 'email', header: 'Email', render: (row) => row.user?.email },
            { key: 'assignedTasks', header: 'Assigned tasks' },
            { key: 'status', header: 'Status', render: (row) => <Badge variant={row.user?.status === 'active' ? 'success' : 'neutral'}>{row.user?.status}</Badge> },
            ...(hasPermission('team:manage')
              ? [{ key: 'actions', header: '', render: (row) => <Button size="sm" variant="danger" onClick={() => setRemoving(row)}>Remove</Button> }]
              : []),
          ]}
        />
      </Card>
      <Modal open={open} title="Add team member" onClose={() => setOpen(false)}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Select label="Person" value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Select a person</option>
            {(users?.items || []).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </Select>
          <Select label="Project role" value={role} onChange={(e) => setRole(e.target.value)}>
            {['Lead', 'Developer', 'Designer', 'QA', 'Viewer'].map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Button onClick={() => add.mutate()} disabled={!userId || add.isPending}>Add member</Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove member?"
        message="They will lose access to this project."
        onClose={() => setRemoving(null)}
        onConfirm={() => remove.mutate(removing.user?._id)}
      />
    </div>
  );
}
