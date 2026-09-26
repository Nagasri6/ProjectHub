import { Project } from '../models/Project.js';
import { TeamMember } from '../models/TeamMember.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { Issue } from '../models/Issue.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activity.js';
import { assertProjectAccess } from '../utils/projectAccess.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const listProjects = asyncHandler(async (req, res) => {
  const { search, status, owner, sort = '-updatedAt', page = 1, limit = 8 } = req.query;
  const filter = {};

  if (req.user.role !== 'admin') {
    const memberships = await TeamMember.find({ user: req.user._id }).select('project');
    filter._id = { $in: memberships.map((item) => item.project) };
  }

  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: 'i' };
  }
  if (status) filter.status = status;
  if (owner) filter.owner = owner;

  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.min(50, Number(limit) || 8);

  const [items, total] = await Promise.all([
    Project.find(filter)
      .populate('owner', 'name email avatar title role')
      .sort(sort)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Project.countDocuments(filter),
  ]);

  const projectIds = items.map((item) => item._id);
  const [taskCounts, memberCounts] = await Promise.all([
    Task.aggregate([{ $match: { project: { $in: projectIds } } }, { $group: { _id: '$project', count: { $sum: 1 } } }]),
    TeamMember.aggregate([{ $match: { project: { $in: projectIds } } }, { $group: { _id: '$project', count: { $sum: 1 } } }]),
  ]);

  const taskMap = Object.fromEntries(taskCounts.map((row) => [row._id.toString(), row.count]));
  const memberMap = Object.fromEntries(memberCounts.map((row) => [row._id.toString(), row.count]));

  res.json({
    items: items.map((project) => ({
      ...project.toObject(),
      id: project._id.toString(),
      taskCount: taskMap[project._id.toString()] || 0,
      memberCount: memberMap[project._id.toString()] || 0,
    })),
    total,
    page: pageNum,
    pages: Math.ceil(total / pageSize) || 1,
  });
});

export const getProject = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.user, req.params.id);
  const project = await Project.findById(req.params.id).populate('owner', 'name email avatar title role');
  if (!project) throw new ApiError(404, 'Project not found');

  const [taskCount, completedTasks, inProgressTasks, reviewTasks, blockedIssues, memberCount, recentActivity] =
    await Promise.all([
      Task.countDocuments({ project: project._id }),
      Task.countDocuments({ project: project._id, status: 'Done' }),
      Task.countDocuments({ project: project._id, status: 'In Progress' }),
      Task.countDocuments({ project: project._id, status: 'Review' }),
      Issue.countDocuments({ project: project._id, status: { $in: ['Open', 'In Progress'] }, priority: { $in: ['High', 'Critical'] } }),
      TeamMember.countDocuments({ project: project._id }),
      Activity.find({ project: project._id }).populate('user', 'name avatar').sort('-createdAt').limit(6),
    ]);

  const todoTasks = await Task.countDocuments({ project: project._id, status: 'To Do' });

  res.json({
    ...project.toObject(),
    id: project._id.toString(),
    stats: {
      taskCount,
      completedTasks,
      inProgressTasks,
      reviewTasks,
      todoTasks,
      blockedIssues,
      memberCount,
    },
    recentActivity,
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, owner, startDate, targetDate, status, category, color } = req.body;
  if (!name || !startDate || !targetDate) {
    throw new ApiError(400, 'Name, start date, and target date are required');
  }

  const project = await Project.create({
    name,
    description,
    owner: owner || req.user._id,
    startDate,
    targetDate,
    status: status || 'Planning',
    category: category || 'Product',
    color: color || '#6366F1',
  });

  await TeamMember.create({
    project: project._id,
    user: project.owner,
    projectRole: 'Owner',
  });

  await logActivity({
    user: req.user._id,
    project: project._id,
    action: 'created project',
    target: project.name,
    type: 'created',
  });

  const populated = await project.populate('owner', 'name email avatar title role');
  res.status(201).json({ ...populated.toObject(), id: populated._id.toString() });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
    'owner',
    'name email avatar title role',
  );
  if (!project) throw new ApiError(404, 'Project not found');

  await logActivity({
    user: req.user._id,
    project: project._id,
    action: 'updated project',
    target: project.name,
    type: 'updated',
  });

  res.json({ ...project.toObject(), id: project._id.toString() });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  await Promise.all([
    Task.deleteMany({ project: project._id }),
    TeamMember.deleteMany({ project: project._id }),
    Issue.deleteMany({ project: project._id }),
    Activity.deleteMany({ project: project._id }),
    project.deleteOne(),
  ]);
  res.json({ message: 'Project deleted' });
});
