import { useOutletContext } from 'react-router-dom';
import { differenceInDays, format, min, max } from 'date-fns';
import { useProjectTasks } from '../../tasks/hooks/useTasks';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { taskStatusVariant } from '../../../lib/status';
import { isOverdue } from '../../../lib/format';

export function ProjectTimelinePage() {
  const { project } = useOutletContext();
  const { data: tasks = [], isLoading, isError, refetch } = useProjectTasks(project._id);

  if (isLoading) return <Skeleton height={320} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const dated = tasks.filter((task) => task.startDate || task.dueDate);
  const start = min([new Date(project.startDate), ...dated.map((task) => new Date(task.startDate || task.dueDate))]);
  const end = max([new Date(project.targetDate), ...dated.map((task) => new Date(task.dueDate || task.startDate))]);
  const span = Math.max(1, differenceInDays(end, start));
  const phases = [...new Set(tasks.map((task) => task.phase).filter(Boolean))];

  return (
    <Card>
      <CardHeader title="Project timeline" />
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
        {format(start, 'MMM d')} — {format(end, 'MMM d, yyyy')}
      </p>
      <div style={{ overflowX: 'auto' }}>
        {(phases.length ? phases : ['Work']).map((phase) => (
          <div key={phase} style={{ marginBottom: 18 }}>
            <strong>{phase}</strong>
            {tasks.filter((task) => (task.phase || 'Work') === phase).map((task) => {
              const from = new Date(task.startDate || project.startDate);
              const to = new Date(task.dueDate || project.targetDate);
              const left = (differenceInDays(from, start) / span) * 100;
              const width = Math.max(8, (differenceInDays(to, from) / span) * 100);
              return (
                <div key={task._id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 90px', gap: 12, alignItems: 'center', marginTop: 8 }}>
                  <div style={{ fontSize: 13 }}>{task.title}</div>
                  <div style={{ position: 'relative', height: 28, background: '#f1f5f9', borderRadius: 999 }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${width}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: isOverdue(task.dueDate, task.status) ? '#ef4444' : '#6366f1',
                        opacity: task.status === 'Done' ? 0.55 : 1,
                      }}
                    />
                  </div>
                  <Badge variant={taskStatusVariant[task.status]}>{task.status}</Badge>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
