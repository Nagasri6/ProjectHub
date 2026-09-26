import { Activity } from '../models/Activity.js';

export async function logActivity({ user, project, action, target, type = 'updated' }) {
  return Activity.create({ user, project, action, target, type });
}
