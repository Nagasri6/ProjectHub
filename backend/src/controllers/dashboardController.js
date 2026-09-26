import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Issue } from '../models/Issue.js';
import { Activity } from '../models/Activity.js';
import { TeamMember } from '../models/TeamMember.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  let projectIds;
  if (req.user.role === 'admin') {
    const projects = await Project.find().select('_id');
    projectIds = projects.map((project) => project._id);
  } else {
    const memberships = await TeamMember.find({ user: req.user._id }).select('project');
    projectIds = memberships.map((item) => item.project);
  }

  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [projects, myTasks, dueSoon, blockedIssues, activity, allTasks, recentProjects] = await Promise.all([
    Project.find({ _id: { $in: projectIds } }).populate('owner', 'name avatar title').sort('-updatedAt'),
    Task.find({ assignee: req.user._id, status: { $ne: 'Done' } })
      .populate('project', 'name color')
      .sort('dueDate')
      .limit(6),
    Task.find({
      project: { $in: projectIds },
      dueDate: { $gte: now, $lte: weekAhead },
      status: { $ne: 'Done' },
    }).countDocuments(),
    Issue.countDocuments({
      project: { $in: projectIds },
      status: { $in: ['Open', 'In Progress'] },
      priority: { $in: ['High', 'Critical'] },
    }),
    Activity.find({ project: { $in: projectIds } })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .limit(8),
    Task.find({ project: { $in: projectIds } }).select('status'),
    Project.find({ _id: { $in: projectIds } })
      .populate('owner', 'name avatar title')
      .sort('-updatedAt')
      .limit(5),
  ]);

  const membersByProject = await TeamMember.find({ project: { $in: recentProjects.map((p) => p._id) } }).populate(
    'user',
    'name avatar',
  );

  const teamMap = {};
  membersByProject.forEach((member) => {
    const key = member.project.toString();
    teamMap[key] = teamMap[key] || [];
    if (member.user) teamMap[key].push(member.user);
  });

  const upcoming = await Task.find({
    project: { $in: projectIds },
    dueDate: { $exists: true },
    status: { $ne: 'Done' },
  })
    .populate('project', 'name')
    .sort('dueDate')
    .limit(5);

  res.json({
    stats: {
      totalProjects: projects.length,
      myTasks: await Task.countDocuments({ assignee: req.user._id, status: { $ne: 'Done' } }),
      dueSoon,
      blocked: blockedIssues,
    },
    projects: projects.slice(0, 4),
    myTasks,
    activity,
    upcoming,
    recentProjects: recentProjects.map((project) => ({
      ...project.toObject(),
      team: teamMap[project._id.toString()] || [],
    })),
    projectProgress: {
      overall: projects.length
        ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)
        : 0,
      completed: projects.filter((p) => p.status === 'Completed').length,
      inProgress: projects.filter((p) => ['In Progress', 'On Track', 'Planning'].includes(p.status)).length,
      atRisk: projects.filter((p) => p.status === 'At Risk').length,
      blocked: blockedIssues,
    },
    taskStatus: {
      total: allTasks.length,
      todo: allTasks.filter((t) => t.status === 'To Do').length,
      inProgress: allTasks.filter((t) => t.status === 'In Progress').length,
      review: allTasks.filter((t) => t.status === 'Review').length,
      done: allTasks.filter((t) => t.status === 'Done').length,
    },
  });
});
