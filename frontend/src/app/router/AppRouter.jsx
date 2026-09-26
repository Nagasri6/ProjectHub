import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { GuestRoute, ProtectedRoute } from './guards';
import { Spinner } from '../../components/feedback/Feedback';

const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProjectsPage = lazy(() => import('../../features/projects/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectLayout = lazy(() => import('../../features/projects/pages/ProjectLayout').then((m) => ({ default: m.ProjectLayout })));
const ProjectOverviewPage = lazy(() => import('../../features/projects/pages/ProjectOverviewPage').then((m) => ({ default: m.ProjectOverviewPage })));
const ProjectTasksPage = lazy(() => import('../../features/tasks/pages/ProjectTasksPage').then((m) => ({ default: m.ProjectTasksPage })));
const TaskDetailsPage = lazy(() => import('../../features/tasks/pages/TaskDetailsPage').then((m) => ({ default: m.TaskDetailsPage })));
const MyTasksPage = lazy(() => import('../../features/tasks/pages/MyTasksPage').then((m) => ({ default: m.MyTasksPage })));
const ProjectTimelinePage = lazy(() => import('../../features/timeline/pages/ProjectTimelinePage').then((m) => ({ default: m.ProjectTimelinePage })));
const GlobalTimelinePage = lazy(() => import('../../features/timeline/pages/GlobalTimelinePage').then((m) => ({ default: m.GlobalTimelinePage })));
const ProjectFilesPage = lazy(() => import('../../features/files/pages/ProjectFilesPage').then((m) => ({ default: m.ProjectFilesPage })));
const GlobalFilesPage = lazy(() => import('../../features/files/pages/ProjectFilesPage').then((m) => ({ default: m.GlobalFilesPage })));
const ProjectTeamPage = lazy(() => import('../../features/team/pages/ProjectTeamPage').then((m) => ({ default: m.ProjectTeamPage })));
const TeamPage = lazy(() => import('../../features/team/pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const ProjectIssuesPage = lazy(() => import('../../features/issues/pages/IssuesPage').then((m) => ({ default: m.ProjectIssuesPage })));
const GlobalIssuesPage = lazy(() => import('../../features/issues/pages/IssuesPage').then((m) => ({ default: m.GlobalIssuesPage })));
const ProjectActivityPage = lazy(() => import('../../features/activity/pages/ActivityPage').then((m) => ({ default: m.ProjectActivityPage })));
const GlobalActivityPage = lazy(() => import('../../features/activity/pages/ActivityPage').then((m) => ({ default: m.GlobalActivityPage })));
const ReportsPage = lazy(() => import('../../features/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const WorkloadPage = lazy(() => import('../../features/reports/pages/ReportsPage').then((m) => ({ default: m.WorkloadPage })));
const ProfilePage = lazy(() => import('../../features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('../../features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const CalendarPage = lazy(() => import('../../features/calendar/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const NotFoundPage = lazy(() => import('../../features/auth/pages/StatusPages').then((m) => ({ default: m.NotFoundPage })));
const ForbiddenPage = lazy(() => import('../../features/auth/pages/StatusPages').then((m) => ({ default: m.ForbiddenPage })));

export function AppRouter() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ProjectOverviewPage />} />
              <Route path="tasks" element={<ProjectTasksPage />} />
              <Route path="timeline" element={<ProjectTimelinePage />} />
              <Route path="files" element={<ProjectFilesPage />} />
              <Route path="team" element={<ProjectTeamPage />} />
              <Route path="issues" element={<ProjectIssuesPage />} />
              <Route path="activity" element={<ProjectActivityPage />} />
            </Route>
            <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/timeline" element={<GlobalTimelinePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/files" element={<GlobalFilesPage />} />
            <Route path="/issues" element={<GlobalIssuesPage />} />
            <Route path="/activity" element={<GlobalActivityPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/workload" element={<WorkloadPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
