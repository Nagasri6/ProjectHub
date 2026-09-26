import { useProjects } from '../../projects/hooks/useProjects';
import { Card, CardHeader, ProgressBar } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { PageHeader } from '../../../components/ui/PageHeader';
import { projectStatusVariant } from '../../../lib/status';
import { formatDate } from '../../../lib/format';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { Link } from 'react-router-dom';

export function GlobalTimelinePage() {
  const { data, isLoading, isError, refetch } = useProjects({ limit: 20 });
  if (isLoading) return <Skeleton height={280} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Timeline" subtitle="A cross-project view of dates, progress, and health." />
      <Card>
        <CardHeader title="Active programs" />
        {(data.items || []).map((project) => (
          <Link key={project._id} to={`/projects/${project._id}/timeline`} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 140px 120px', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
            <strong>{project.name}</strong>
            <ProgressBar value={project.progress} />
            <Badge variant={projectStatusVariant[project.status]}>{project.status}</Badge>
            <span>{formatDate(project.targetDate)}</span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
