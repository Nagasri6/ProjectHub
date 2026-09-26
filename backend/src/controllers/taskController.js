import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Project } from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activity.js';
import { assertProjectAccess } from '../utils/projectAccess.js';
import { refreshProjectProgress } from '../utils/progress.js';
import { Notification } from '../models/Notification.js';

const populateTask = [
  { path: 'assignee', select: 'name email avatar title role' },
  { path: 'project', select: 'name color status' },
];

export const listProjectTasks = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.user, req.params.id);
  const tasks = await Task.find({ project: req.params.id }).populate(populateTask).sort('order createdAt');
  res.json(tasks.map((task) => ({ ...task.toObject(), id: task._id.toString() })));
});

export const listMyTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, sort = 'dueDate' } = req.query;
  const filter = { assignee: req.user._id };
  if (search) filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  const tasks = await Task.find(filter).populate(populateTask).sort(sort);
  res.json(tasks.map((task) => ({ ...task.toObject(), id: task._id.toString() })));
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(populateTask);
  if (!task) throw new ApiError(404, 'Task not found');
  await assertProjectAccess(req.user, task.project._id || task.project);
  const comments = await Comment.find({ task: task._id }).populate('author', 'name avatar title').sort('createdAt');
  res.json({ ...task.toObject(), id: task._id.toString(), comments });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, assignee, status, priority, dueDate, startDate, labels, phase, subtasks } =
    req.body;
  if (!title || !project) throw new ApiError(400, 'Title and project are required');
  await assertProjectAccess(req.user, project);

  const count = await Task.countDocuments({ project });
  const task = await Task.create({
    title,
    description,
    project,
    assignee,
    status: status || 'To Do',
    priority: priority || 'Medium',
    dueDate,
    startDate,
    labels: labels || [],
    phase,
    subtasks: subtasks || [],
    order: count,
  });

  await refreshProjectProgress(project);
  const projectDoc = await Project.findById(project);
  await logActivity({
    user: req.user._id,
    project,
    action: 'created task',
    target: title,
    type: 'created',
  });

  if (assignee && assignee !== req.user._id.toString()) {
    await Notification.create({
      user: assignee,
      title: 'You were assigned a task',
      body: `${req.user.name} assigned ${title} in ${projectDoc?.name || 'a project'}`,
      type: 'task',
      link: `/tasks/${task._id}`,
    });
  }

  const populated = await task.populate(populateTask);
  res.status(201).json({ ...populated.toObject(), id: populated._id.toString() });
});

export const updateTask = asyncHandler(async (req, res) => {
  const existing = await Task.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Task not found');
  await assertProjectAccess(req.user, existing.project);

  const previousStatus = existing.status;
  Object.assign(existing, req.body);
  await existing.save();
  await refreshProjectProgress(existing.project);

  if (req.body.status && req.body.status !== previousStatus) {
    await logActivity({
      user: req.user._id,
      project: existing.project,
      action: req.body.status === 'Done' ? 'completed' : `moved ${existing.title} to ${req.body.status}`,
      target: existing.title,
      type: req.body.status === 'Done' ? 'completed' : 'moved',
    });
  } else {
    await logActivity({
      user: req.user._id,
      project: existing.project,
      action: 'updated task',
      target: existing.title,
      type: 'updated',
    });
  }

  if (req.body.assignee && req.body.assignee !== req.user._id.toString()) {
    await Notification.create({
      user: req.body.assignee,
      title: 'You were assigned a task',
      body: `${req.user.name} assigned ${existing.title}`,
      type: 'task',
      link: `/tasks/${existing._id}`,
    });
  }

  const populated = await existing.populate(populateTask);
  res.json({ ...populated.toObject(), id: populated._id.toString() });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  await assertProjectAccess(req.user, task.project);
  await Comment.deleteMany({ task: task._id });
  await task.deleteOne();
  await refreshProjectProgress(task.project);
  res.json({ message: 'Task deleted' });
});

export const listComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ task: req.params.id }).populate('author', 'name avatar title').sort('createdAt');
  res.json(comments);
});

export const addComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  if (!req.body.body?.trim()) throw new ApiError(400, 'Comment cannot be empty');
  const comment = await Comment.create({
    task: task._id,
    author: req.user._id,
    body: req.body.body.trim(),
  });
  await logActivity({
    user: req.user._id,
    project: task.project,
    action: 'commented on',
    target: task.title,
    type: 'commented',
  });
  const populated = await comment.populate('author', 'name avatar title');
  res.status(201).json(populated);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own comments');
  }
  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});
