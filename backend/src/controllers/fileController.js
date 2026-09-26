import fs from 'fs/promises';
import path from 'path';
import { File } from '../models/File.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from '../utils/activity.js';
import { assertProjectAccess } from '../utils/projectAccess.js';
import { env } from '../config/env.js';

export const listProjectFiles = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.user, req.params.id);
  const { search, type } = req.query;
  const filter = { project: req.params.id };
  if (search) filter.originalName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (type) filter.type = { $regex: type, $options: 'i' };
  const files = await File.find(filter).populate('uploadedBy', 'name avatar').sort('-createdAt');
  res.json(files.map((file) => ({ ...file.toObject(), id: file._id.toString() })));
});

export const listAllFiles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
    const { TeamMember } = await import('../models/TeamMember.js');
    const memberships = await TeamMember.find({ user: req.user._id }).select('project');
    filter.project = { $in: memberships.map((item) => item.project) };
  }
  const files = await File.find(filter)
    .populate('uploadedBy', 'name avatar')
    .populate('project', 'name color')
    .sort('-createdAt');
  res.json(files.map((file) => ({ ...file.toObject(), id: file._id.toString() })));
});

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  await assertProjectAccess(req.user, req.params.id);
  const file = await File.create({
    name: req.file.filename,
    originalName: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    project: req.params.id,
    task: req.body.taskId,
    uploadedBy: req.user._id,
  });
  await logActivity({
    user: req.user._id,
    project: req.params.id,
    action: 'uploaded',
    target: req.file.originalname,
    type: 'uploaded',
  });
  const populated = await file.populate('uploadedBy', 'name avatar');
  res.status(201).json({ ...populated.toObject(), id: populated._id.toString() });
});

export const downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) throw new ApiError(404, 'File not found');
  if (file.project) {
    await assertProjectAccess(req.user, file.project);
  }
  try {
    await fs.access(file.path);
  } catch {
    throw new ApiError(404, 'File is no longer available');
  }
  res.download(file.path, file.originalName);
});

export const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) throw new ApiError(404, 'File not found');
  await fs.unlink(file.path).catch(() => {});
  await file.deleteOne();
  res.json({ message: 'File deleted' });
});

export function fileUrl(file) {
  return path.relative(env.uploadDir, file.path);
}
