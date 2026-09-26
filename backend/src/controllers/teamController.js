import { TeamMember } from '../models/TeamMember.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activity.js';
import { assertProjectAccess } from '../utils/projectAccess.js';

export const listProjectTeam = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.user, req.params.id);
  const members = await TeamMember.find({ project: req.params.id }).populate(
    'user',
    'name email avatar title role status',
  );
  const counts = await Task.aggregate([
    { $match: { project: members[0]?.project } },
    { $group: { _id: '$assignee', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((row) => [row._id?.toString(), row.count]));

  res.json(
    members.map((member) => ({
      ...member.toObject(),
      assignedTasks: countMap[member.user?._id.toString()] || 0,
    })),
  );
});

export const addProjectMember = asyncHandler(async (req, res) => {
  const { userId, projectRole } = req.body;
  if (!userId) throw new ApiError(400, 'User is required');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const member = await TeamMember.create({
    project: req.params.id,
    user: userId,
    projectRole: projectRole || 'Developer',
  });

  await logActivity({
    user: req.user._id,
    project: req.params.id,
    action: 'added team member',
    target: user.name,
    type: 'created',
  });

  const populated = await member.populate('user', 'name email avatar title role status');
  res.status(201).json(populated);
});

export const updateProjectMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findOneAndUpdate(
    { project: req.params.id, user: req.params.userId },
    { projectRole: req.body.projectRole },
    { new: true },
  ).populate('user', 'name email avatar title role status');
  if (!member) throw new ApiError(404, 'Team member not found');
  res.json(member);
});

export const removeProjectMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findOneAndDelete({ project: req.params.id, user: req.params.userId }).populate(
    'user',
    'name',
  );
  if (!member) throw new ApiError(404, 'Team member not found');
  await logActivity({
    user: req.user._id,
    project: req.params.id,
    action: 'removed team member',
    target: member.user?.name || 'member',
    type: 'deleted',
  });
  res.json({ message: 'Member removed' });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { search, role, status, page = 1, limit = 12 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.min(50, Number(limit) || 12);

  const [items, total] = await Promise.all([
    User.find(filter).sort('name').skip((pageNum - 1) * pageSize).limit(pageSize),
    User.countDocuments(filter),
  ]);

  const userIds = items.map((user) => user._id);
  const [projectCounts, taskCounts] = await Promise.all([
    TeamMember.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { assignee: { $in: userIds } } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } },
    ]),
  ]);

  const projectMap = Object.fromEntries(projectCounts.map((row) => [row._id.toString(), row.count]));
  const taskMap = Object.fromEntries(taskCounts.map((row) => [row._id.toString(), row.count]));

  res.json({
    items: items.map((user) => ({
      ...user.toPublic(),
      projectCount: projectMap[user._id.toString()] || 0,
      taskCount: taskMap[user._id.toString()] || 0,
    })),
    total,
    page: pageNum,
    pages: Math.ceil(total / pageSize) || 1,
  });
});
