import { Link, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { ProgressBar } from '../../../components/ui/Card';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { projectStatusVariant } from '../../../lib/status';

export function ProjectLayout() {
  const { projectId } = useParams();
  const { data, isLoading, isError, refetch } = useProject(projectId);

  if (isLoading) return <Skeleton height={240} />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const tabs = [
    { to: `/projects/${projectId}/overview`, label: 'Overview' },
    { to: `/projects/${projectId}/tasks`, label: 'Tasks' },
    { to: `/projects/${projectId}/timeline`, label: 'Timeline' },
    { to: `/projects/${projectId}/files`, label: 'Files' },
    { to: `/projects/${projectId}/team`, label: 'Team' },
    { to: `/projects/${projectId}/issues`, label: 'Issues' },
    { to: `/projects/${projectId}/activity`, label: 'Activity' },
  ];

  return (
    <div>
      <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', marginBottom: 12 }}>
        <ArrowLeft size={16} /> Projects
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>{data.name}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{data.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge variant={projectStatusVariant[data.status]}>{data.status}</Badge>
          <div style={{ width: 140 }}>
            <ProgressBar value={data.progress} />
          </div>
          <strong>{data.progress}%</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={data.owner?.name} src={data.owner?.avatar} size="sm" />
            <span>{data.owner?.name}</span>
          </div>
        </div>
      </div>
      <Tabs items={tabs} />
      <div style={{ marginTop: 20 }}>
        <Outlet context={{ project: data }} />
      </div>
    </div>
  );
}
