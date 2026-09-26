import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, ProgressBar } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { formatDate, formatRelative } from '../../../lib/format';
import { projectStatusVariant } from '../../../lib/status';
import { CheckSquare, Loader, Eye } from 'lucide-react';
import styles from '../../dashboard/pages/dashboard.module.css';

export function ProjectOverviewPage() {
  const { project } = useOutletContext();
  const stats = project.stats || {};

  return (
    <div className="page-grid">
      <Card>
        <CardHeader title="About this project" />
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>{project.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          <Meta label="Owner" value={project.owner?.name} />
          <Meta label="Status" value={<Badge variant={projectStatusVariant[project.status]}>{project.status}</Badge>} />
          <Meta label="Start date" value={formatDate(project.startDate)} />
          <Meta label="Target date" value={formatDate(project.targetDate)} />
          <Meta label="Team" value={`${stats.memberCount || 0} people`} />
          <Meta label="Health" value={project.status === 'At Risk' ? 'Needs attention' : 'Stable'} />
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ProgressBar value={project.progress} />
          <strong>{project.progress}%</strong>
        </div>
      </Card>
      <div className={styles.stats}>
        <StatCard label="Total tasks" value={stats.taskCount || 0} icon={<CheckSquare size={18} />} />
        <StatCard label="Completed" value={stats.completedTasks || 0} icon={<CheckSquare size={18} />} iconColor="#10b981" iconBg="#d1fae5" />
        <StatCard label="In progress" value={stats.inProgressTasks || 0} icon={<Loader size={18} />} iconColor="#3b82f6" iconBg="#dbeafe" />
        <StatCard label="In review" value={stats.reviewTasks || 0} icon={<Eye size={18} />} iconColor="#f59e0b" iconBg="#fef3c7" />
      </div>
      <div className={styles.middle} style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card>
          <CardHeader title="Project health" />
          <p>Blocked issues: {stats.blockedIssues || 0}</p>
          <p>To do: {stats.todoTasks || 0}</p>
          <p>Team size: {stats.memberCount || 0}</p>
        </Card>
        <Card>
          <CardHeader title="Recent activity" />
          {(project.recentActivity || []).map((item) => (
            <div key={item._id} className={styles.row}>
              <Avatar name={item.user?.name} src={item.user?.avatar} size="sm" />
              <div className={styles.grow}>
                <div><strong>{item.user?.name}</strong> {item.action} {item.target}</div>
                <div className={styles.muted}>{formatRelative(item.createdAt)}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ marginTop: 4 }}>{value}</div>
    </div>
  );
}
