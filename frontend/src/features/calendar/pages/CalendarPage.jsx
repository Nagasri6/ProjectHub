import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { useMyTasks } from '../../tasks/hooks/useTasks';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { priorityVariant } from '../../../lib/status';
import { Link } from 'react-router-dom';

export function CalendarPage() {
  const { data: tasks = [], isLoading, isError, refetch } = useMyTasks();
  if (isLoading) return <Skeleton height={360} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());
  const days = eachDayOfInterval({ start, end });

  return (
    <div>
      <PageHeader title="Calendar" subtitle={`Deadlines in ${format(start, 'MMMM yyyy')}.`} />
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)' }}>{day}</div>
          ))}
          {Array.from({ length: start.getDay() }).map((_, index) => <div key={`empty-${index}`} />)}
          {days.map((day) => {
            const items = tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), day));
            return (
              <div key={day.toISOString()} style={{ minHeight: 88, border: '1px solid var(--color-border)', borderRadius: 10, padding: 8, background: isToday(day) ? '#eef2ff' : '#fff' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{format(day, 'd')}</div>
                {items.slice(0, 2).map((task) => (
                  <Link key={task._id} to={`/tasks/${task._id}`} style={{ display: 'block', marginTop: 4 }}>
                    <Badge variant={priorityVariant[task.priority]}>{task.title}</Badge>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
