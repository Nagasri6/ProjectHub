import { Activity } from '../models/Activity.js';
import { TeamMember } from '../models/TeamMember.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { assertProjectAccess } from '../utils/projectAccess.js';

export const listProjectActivity = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.user, req.params.id);
  const items = await Activity.find({ project: req.params.id })
    .populate('user', 'name avatar title')
    .sort('-createdAt')
    .limit(80);
  res.json(items);
});

export const listAllActivity = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
    const memberships = await TeamMember.find({ user: req.user._id }).select('project');
    filter.project = { $in: memberships.map((item) => item.project) };
  }
  const items = await Activity.find(filter)
    .populate('user', 'name avatar title')
    .populate('project', 'name color')
    .sort('-createdAt')
    .limit(80);
  res.json(items);
});
