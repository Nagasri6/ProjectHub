import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { formatRelative } from '../../../lib/format';

export function ProjectActivityPage() {
  const { project } = useOutletContext();
  return <ActivityList endpoint={`/projects/${project._id}/activity`} title="Project activity" />;
}

export function GlobalActivityPage() {
  return (
    <div>
      <PageHeader title="Activity" subtitle="A chronological stream of work across your projects." />
      <ActivityList endpoint="/activity" />
    </div>
  );
}

function ActivityList({ endpoint, title }) {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['activity', endpoint],
    queryFn: () => apiClient.get(endpoint),
  });
  if (isLoading) return <Skeleton height={280} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <Card>
      {title ? <CardHeader title={title} /> : null}
      {data.map((item) => (
        <div key={item._id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
          <Avatar name={item.user?.name} src={item.user?.avatar} />
          <div>
            <div>
              <strong>{item.user?.name}</strong> {item.action} <strong>{item.target}</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {item.project?.name ? `${item.project.name} · ` : ''}
              {formatRelative(item.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}
