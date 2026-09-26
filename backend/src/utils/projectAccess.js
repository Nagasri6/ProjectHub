import { TeamMember } from '../models/TeamMember.js';
import { ApiError } from './apiError.js';

export async function assertProjectAccess(user, projectId) {
  if (user.role === 'admin') return true;
  const membership = await TeamMember.findOne({ project: projectId, user: user._id });
  if (!membership) {
    throw new ApiError(403, 'You are not a member of this project');
  }
  return membership;
}
