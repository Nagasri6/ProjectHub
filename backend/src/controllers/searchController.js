import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { File } from '../models/File.js';
import { TeamMember } from '../models/TeamMember.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json({ projects: [], tasks: [], users: [], issues: [], files: [] });
  }

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  let projectFilter = { name: regex };

  if (req.user.role !== 'admin') {
    const memberships = await TeamMember.find({ user: req.user._id }).select('project');
    const ids = memberships.map((item) => item.project);
    projectFilter = { _id: { $in: ids }, name: regex };
  }

  const [projects, tasks, users, issues, files] = await Promise.all([
    Project.find(projectFilter).select('name status progress color').limit(5),
    Task.find({ title: regex }).populate('project', 'name').select('title status priority project').limit(5),
    User.find({ $or: [{ name: regex }, { email: regex }] }).select('name email avatar title role').limit(5),
    Issue.find({ title: regex }).populate('project', 'name').select('title status priority project').limit(5),
    File.find({ originalName: regex }).populate('project', 'name').select('originalName type size project').limit(5),
  ]);

  res.json({ projects, tasks, users, issues, files });
});
