import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, ListChecks, CalendarClock, AlertTriangle, FolderPlus, CheckSquare, Bug, FilePlus, Pencil, MessageCircle, Upload } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from '../../../components/ui/StatCard';
import { Card, CardHeader, ProgressBar } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Avatar, AvatarGroup } from '../../../components/ui/Avatar';
import { Table } from '../../../components/ui/Table';
import { Skeleton, ErrorState } from '../../../components/feedback/Feedback';
import { projectStatusVariant, priorityVariant } from '../../../lib/status';
import { formatDate, formatDue, formatRelative } from '../../../lib/format';
import styles from './dashboard.module.css';

const actionIcon = {
  updated: Pencil,
  commented: MessageCircle,
  uploaded: Upload,
  created: FolderPlus,
  completed: CheckSquare,
  moved: Pencil,
  assigned: ListChecks,
};

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const progressData = [
    { name: 'Completed', value: data.projectProgress.completed, color: '#10b981' },
    { name: 'In Progress', value: data.projectProgress.inProgress, color: '#6366f1' },
    { name: 'At Risk', value: data.projectProgress.atRisk, color: '#f59e0b' },
    { name: 'Blocked', value: data.projectProgress.blocked, color: '#ef4444' },
  ];

  const taskData = [
    { name: 'To Do', value: data.taskStatus.todo, color: '#94a3b8' },
    { name: 'In Progress', value: data.taskStatus.inProgress, color: '#3b82f6' },
    { name: 'Review', value: data.taskStatus.review, color: '#f59e0b' },
    { name: 'Done', value: data.taskStatus.done, color: '#10b981' },
  ];

  return (
    <div className="page-grid">
      <div className={styles.stats}>
        <StatCard label="Total Projects" value={data.stats.totalProjects} meta="↑ 2 from last month" icon={<FolderKanban size={18} />} />
        <StatCard label="My Tasks" value={data.stats.myTasks} meta="↑ 5 from last week" icon={<ListChecks size={18} />} iconColor="#3b82f6" iconBg="#dbeafe" />
        <StatCard label="Due Soon" value={data.stats.dueSoon} meta="Due in next 7 days" icon={<CalendarClock size={18} />} iconColor="#f59e0b" iconBg="#fef3c7" />
        <StatCard label="Blocked" value={data.stats.blocked} meta="Needs attention" icon={<AlertTriangle size={18} />} iconColor="#ef4444" iconBg="#fee2e2" />
      </div>

      <div className={styles.middle}>
        <Card>
          <CardHeader title="Projects Overview" to="/projects" actionLabel="View all projects" />
          {data.projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} className={styles.row}>
              <div className={styles.mark} style={{ background: project.color }}>{project.name[0]}</div>
              <div className={styles.grow}>
                <div style={{ fontWeight: 600 }}>{project.name}</div>
                <div className={styles.muted}>{project.category}</div>
              </div>
              <div style={{ width: 120 }}>
                <ProgressBar value={project.progress} />
              </div>
              <span style={{ width: 40, fontSize: 13, fontWeight: 600 }}>{project.progress}%</span>
              <Badge variant={projectStatusVariant[project.status]}>{project.status}</Badge>
            </Link>
          ))}
        </Card>

        <Card>
          <CardHeader title="My Tasks" to="/my-tasks" />
          {data.myTasks.map((task) => (
            <Link key={task._id} to={`/tasks/${task._id}`} className={styles.row}>
              <span style={{ width: 16, height: 16, border: '2px solid #cbd5e1', borderRadius: '50%' }} />
              <div className={styles.grow}>
                <div style={{ fontWeight: 600 }}>{task.title}</div>
                <div className={styles.muted}>{task.project?.name}</div>
              </div>
              <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
              <span className={styles.muted}>{formatDue(task.dueDate)}</span>
            </Link>
          ))}
        </Card>

        <Card>
          <CardHeader title="Activity Feed" to="/activity" />
          {data.activity.map((item) => {
            const Icon = actionIcon[item.type] || Pencil;
            return (
              <div key={item._id} className={styles.row}>
                <Avatar name={item.user?.name} src={item.user?.avatar} size="sm" />
                <div className={styles.grow}>
                  <div style={{ fontSize: 13 }}>
                    <strong>{item.user?.name}</strong> {item.action} {item.target}
                  </div>
                  <div className={styles.muted}>{formatRelative(item.createdAt)}</div>
                </div>
                <Icon size={14} color="#6366f1" />
              </div>
            );
          })}
        </Card>
      </div>

      <div className={styles.charts}>
        <Card>
          <CardHeader title="Project Progress" />
          <Donut data={progressData} center={`${data.projectProgress.overall}%`} label="Overall" />
        </Card>
        <Card>
          <CardHeader title="Task Status" />
          <Donut data={taskData} center={data.taskStatus.total} label="Total" />
        </Card>
        <Card>
          <CardHeader title="Upcoming Deadlines" to="/calendar" actionLabel="View calendar →" />
          {data.upcoming.map((task) => (
            <div key={task._id} className={styles.row}>
              <div className={styles.grow}>
                <div style={{ fontWeight: 600 }}>{task.title}</div>
                <div className={styles.muted}>{task.project?.name}</div>
              </div>
              <span style={{ color: formatDue(task.dueDate) === 'Today' ? '#ef4444' : 'inherit', fontSize: 13, fontWeight: 600 }}>
                {formatDue(task.dueDate)}
              </span>
            </div>
          ))}
        </Card>
        <div className={styles.createCard}>
          <h2 style={{ marginBottom: 16 }}>Create New</h2>
          <div className={styles.createGrid}>
            <button className={styles.createBtn} type="button" onClick={() => navigate('/projects?create=1')}>
              <FolderPlus size={18} color="#6366f1" /> Project
            </button>
            <button className={styles.createBtn} type="button" onClick={() => navigate('/my-tasks?create=1')}>
              <CheckSquare size={18} color="#3b82f6" /> Task
            </button>
            <button className={styles.createBtn} type="button" onClick={() => navigate('/issues?create=1')}>
              <Bug size={18} color="#f59e0b" /> Issue
            </button>
            <button className={styles.createBtn} type="button" onClick={() => navigate('/files')}>
              <FilePlus size={18} color="#10b981" /> File
            </button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader title="Recent Projects" to="/projects" />
        <Table
          rows={data.recentProjects}
          columns={[
            { key: 'name', header: 'Project Name', render: (row) => <Link to={`/projects/${row._id}`} style={{ fontWeight: 600 }}>{row.name}</Link> },
            { key: 'owner', header: 'Owner', render: (row) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={row.owner?.name} src={row.owner?.avatar} size="sm" />
                {row.owner?.name}
              </div>
            ) },
            { key: 'progress', header: 'Progress', render: (row) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                <ProgressBar value={row.progress} />
                <span>{row.progress}%</span>
              </div>
            ) },
            { key: 'status', header: 'Status', render: (row) => <Badge variant={projectStatusVariant[row.status]}>{row.status}</Badge> },
            { key: 'targetDate', header: 'Due Date', render: (row) => formatDate(row.targetDate) },
            { key: 'team', header: 'Team', render: (row) => <AvatarGroup users={row.team} /> },
          ]}
        />
      </Card>
    </div>
  );
}

function Donut({ data, center, label }) {
  return (
    <div className={styles.chartBox}>
      <div style={{ width: 150, height: 150, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{center}</div>
            <div className={styles.muted}>{label}</div>
          </div>
        </div>
      </div>
      <div className={styles.legend}>
        {data.map((item) => (
          <div key={item.name}>
            <span className={styles.dot} style={{ background: item.color }} />
            {item.name} · {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="page-grid">
      <div className={styles.stats}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height={118} />
        ))}
      </div>
      <Skeleton height={280} />
      <Skeleton height={240} />
    </div>
  );
}
