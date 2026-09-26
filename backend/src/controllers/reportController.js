import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Issue } from '../models/Issue.js';
import { TeamMember } from '../models/TeamMember.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assertProjectAccess } from '../utils/projectAccess.js';

async function scopedProjectIds(user) {
  if (user.role === 'admin') {
    const projects = await Project.find().select('_id');
    return projects.map((project) => project._id);
  }
  const memberships = await TeamMember.find({ user: user._id }).select('project');
  return memberships.map((item) => item.project);
}

export const overviewReports = asyncHandler(async (req, res) => {
  const projectIds = await scopedProjectIds(req.user);
  const now = new Date();

  const [projects, tasks, issues, users] = await Promise.all([
    Project.find({ _id: { $in: projectIds } }).populate('owner', 'name avatar'),
    Task.find({ project: { $in: projectIds } }).populate('assignee', 'name avatar').populate('project', 'name'),
    Issue.find({ project: { $in: projectIds } }),
    User.find().select('name avatar title role status'),
  ]);

  const tasksByStatus = ['To Do', 'In Progress', 'Review', 'Done'].map((status) => ({
    name: status,
    value: tasks.filter((task) => task.status === status).length,
  }));

  const projectHealth = ['Planning', 'In Progress', 'On Track', 'At Risk', 'Completed'].map((status) => ({
    name: status,
    value: projects.filter((project) => project.status === status).length,
  }));

  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < now && task.status !== 'Done');
  const blocked = issues.filter((issue) => ['Open', 'In Progress'].includes(issue.status) && ['High', 'Critical'].includes(issue.priority));

  const workload = users
    .map((user) => {
      const assigned = tasks.filter((task) => task.assignee?._id.toString() === user._id.toString());
      return {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        title: user.title,
        total: assigned.length,
        done: assigned.filter((task) => task.status === 'Done').length,
        inProgress: assigned.filter((task) => task.status === 'In Progress').length,
        overdue: assigned.filter((task) => task.dueDate && task.dueDate < now && task.status !== 'Done').length,
      };
    })
    .filter((row) => row.total > 0);

  const overallProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)
    : 0;

  res.json({
    overallProgress,
    projectCount: projects.length,
    taskCount: tasks.length,
    completedTasks: tasks.filter((task) => task.status === 'Done').length,
    overdueCount: overdue.length,
    blockedCount: blocked.length,
    tasksByStatus,
    projectHealth,
    workload,
    overdueTasks: overdue.slice(0, 8),
    projects,
  });
});

export const projectReport = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.user, req.params.id);
  const [project, tasks, issues] = await Promise.all([
    Project.findById(req.params.id).populate('owner', 'name avatar'),
    Task.find({ project: req.params.id }).populate('assignee', 'name avatar'),
    Issue.find({ project: req.params.id }),
  ]);
  res.json({ project, tasks, issues });
});

export const workloadReport = overviewReports;
