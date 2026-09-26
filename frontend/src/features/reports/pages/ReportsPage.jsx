import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiClient } from '../../../services/apiClient';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Table } from '../../../components/ui/Table';
import { Avatar } from '../../../components/ui/Avatar';
import { ErrorState, Skeleton } from '../../../components/feedback/Feedback';
import { FolderKanban, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import styles from '../../dashboard/pages/dashboard.module.css';

export function ReportsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: () => apiClient.get('/reports/overview'),
  });
  if (isLoading) return <Skeleton height={360} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const colors = ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="page-grid">
      <PageHeader title="Reports" subtitle="Progress, health, and workload across the workspace." />
      <div className={styles.stats}>
        <StatCard label="Overall progress" value={`${data.overallProgress}%`} icon={<FolderKanban size={18} />} />
        <StatCard label="Completed tasks" value={data.completedTasks} icon={<CheckSquare size={18} />} iconColor="#10b981" iconBg="#d1fae5" />
        <StatCard label="Overdue" value={data.overdueCount} icon={<Clock size={18} />} iconColor="#f59e0b" iconBg="#fef3c7" />
        <StatCard label="Blocked" value={data.blockedCount} icon={<AlertTriangle size={18} />} iconColor="#ef4444" iconBg="#fee2e2" />
      </div>
      <div className={styles.middle} style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card>
          <CardHeader title="Tasks by status" />
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.tasksByStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                  {data.tasksByStatus.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Project health" />
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={data.projectHealth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader title="Team workload" />
        <Table
          rows={data.workload}
          rowKey="id"
          columns={[
            { key: 'name', header: 'Person', render: (row) => (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Avatar name={row.name} src={row.avatar} size="sm" /> {row.name}
              </div>
            ) },
            { key: 'total', header: 'Assigned' },
            { key: 'inProgress', header: 'In progress' },
            { key: 'done', header: 'Done' },
            { key: 'overdue', header: 'Overdue' },
          ]}
        />
      </Card>
    </div>
  );
}

export function WorkloadPage() {
  return <ReportsPage />;
}
