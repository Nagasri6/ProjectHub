import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as projects from '../controllers/projectController.js';
import * as tasks from '../controllers/taskController.js';
import * as team from '../controllers/teamController.js';
import * as issues from '../controllers/issueController.js';
import * as files from '../controllers/fileController.js';
import * as activity from '../controllers/activityController.js';
import * as notifications from '../controllers/notificationController.js';
import * as reports from '../controllers/reportController.js';
import * as search from '../controllers/searchController.js';
import * as dashboard from '../controllers/dashboardController.js';

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const router = Router();

router.post('/auth/login', auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', requireAuth, auth.me);
router.patch('/auth/profile', requireAuth, auth.updateProfile);
router.patch('/auth/settings', requireAuth, auth.updateSettings);

router.get('/dashboard', requireAuth, dashboard.getDashboard);
router.get('/search', requireAuth, search.globalSearch);

router.get('/projects', requireAuth, projects.listProjects);
router.get('/projects/:id', requireAuth, projects.getProject);
router.post('/projects', requireAuth, requirePermission('project:create'), projects.createProject);
router.patch('/projects/:id', requireAuth, requirePermission('project:edit'), projects.updateProject);
router.delete('/projects/:id', requireAuth, requirePermission('project:delete'), projects.deleteProject);

router.get('/projects/:id/tasks', requireAuth, tasks.listProjectTasks);
router.get('/tasks/mine', requireAuth, tasks.listMyTasks);
router.get('/tasks/:id', requireAuth, tasks.getTask);
router.post('/tasks', requireAuth, requirePermission('task:create'), tasks.createTask);
router.patch('/tasks/:id', requireAuth, requirePermission('task:update'), tasks.updateTask);
router.delete('/tasks/:id', requireAuth, requirePermission('task:delete'), tasks.deleteTask);

router.get('/tasks/:id/comments', requireAuth, tasks.listComments);
router.post('/tasks/:id/comments', requireAuth, requirePermission('comment:create'), tasks.addComment);
router.delete('/comments/:id', requireAuth, tasks.deleteComment);

router.get('/projects/:id/team', requireAuth, team.listProjectTeam);
router.post('/projects/:id/team', requireAuth, requirePermission('team:manage'), team.addProjectMember);
router.patch('/projects/:id/team/:userId', requireAuth, requirePermission('team:manage'), team.updateProjectMember);
router.delete('/projects/:id/team/:userId', requireAuth, requirePermission('team:manage'), team.removeProjectMember);
router.get('/users', requireAuth, requirePermission('user:view'), team.listUsers);

router.get('/issues', requireAuth, issues.listAllIssues);
router.get('/projects/:id/issues', requireAuth, issues.listProjectIssues);
router.post('/issues', requireAuth, requirePermission('issue:create'), issues.createIssue);
router.patch('/issues/:id', requireAuth, requirePermission('issue:update'), issues.updateIssue);
router.delete('/issues/:id', requireAuth, requirePermission('issue:delete'), issues.deleteIssue);

router.get('/files', requireAuth, files.listAllFiles);
router.get('/projects/:id/files', requireAuth, files.listProjectFiles);
router.post('/projects/:id/files', requireAuth, requirePermission('file:upload'), upload.single('file'), files.uploadFile);
router.get('/files/:id/download', requireAuth, files.downloadFile);
router.delete('/files/:id', requireAuth, requirePermission('file:delete'), files.deleteFile);

router.get('/activity', requireAuth, activity.listAllActivity);
router.get('/projects/:id/activity', requireAuth, activity.listProjectActivity);

router.get('/notifications', requireAuth, notifications.listNotifications);
router.patch('/notifications/read-all', requireAuth, notifications.markAllRead);
router.patch('/notifications/:id/read', requireAuth, notifications.markRead);

router.get('/reports/overview', requireAuth, requirePermission('reports:view'), reports.overviewReports);
router.get('/reports/projects/:id', requireAuth, requirePermission('reports:view'), reports.projectReport);
router.get('/reports/workload', requireAuth, requirePermission('reports:view'), reports.workloadReport);
