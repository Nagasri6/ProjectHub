import { Issue } from '../models/Issue.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activity.js';
import { assertProjectAccess } from '../utils/projectAccess.js';
import { Notification } from '../models/Notification.js';

export const listProjectIssues = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.user, req.params.id);
  const { search, status, priority } = req.query;
  const filter = { project: req.params.id };
  if (search) filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  const issues = await Issue.find(filter)
    .populate('assignee', 'name email avatar title')
    .sort('-createdAt');
  res.json(issues.map((issue) => ({ ...issue.toObject(), id: issue._id.toString() })));
});

export const listAllIssues = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
    const { TeamMember } = await import('../models/TeamMember.js');
    const memberships = await TeamMember.find({ user: req.user._id }).select('project');
    filter.project = { $in: memberships.map((item) => item.project) };
  }
  const issues = await Issue.find(filter)
    .populate('assignee', 'name email avatar title')
    .populate('project', 'name color')
    .sort('-createdAt');
  res.json(issues.map((issue) => ({ ...issue.toObject(), id: issue._id.toString() })));
});

export const createIssue = asyncHandler(async (req, res) => {
  const { title, description, project, assignee, status, priority, dueDate } = req.body;
  if (!title || !project) throw new ApiError(400, 'Title and project are required');
  await assertProjectAccess(req.user, project);
  const issue = await Issue.create({ title, description, project, assignee, status, priority, dueDate });
  await logActivity({
    user: req.user._id,
    project,
    action: 'reported issue',
    target: title,
    type: 'created',
  });
  if (assignee) {
    await Notification.create({
      user: assignee,
      title: 'Issue assigned to you',
      body: `${req.user.name} reported ${title}`,
      type: 'issue',
      link: `/projects/${project}/issues`,
    });
  }
  const populated = await issue.populate('assignee', 'name email avatar title');
  res.status(201).json({ ...populated.toObject(), id: populated._id.toString() });
});

export const updateIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) throw new ApiError(404, 'Issue not found');
  await assertProjectAccess(req.user, issue.project);
  Object.assign(issue, req.body);
  await issue.save();
  await logActivity({
    user: req.user._id,
    project: issue.project,
    action: issue.status === 'Resolved' ? 'resolved issue' : 'updated issue',
    target: issue.title,
    type: issue.status === 'Resolved' ? 'completed' : 'updated',
  });
  const populated = await issue.populate('assignee', 'name email avatar title');
  res.json({ ...populated.toObject(), id: populated._id.toString() });
});

export const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) throw new ApiError(404, 'Issue not found');
  await issue.deleteOne();
  res.json({ message: 'Issue deleted' });
});
