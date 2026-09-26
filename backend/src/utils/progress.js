import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';

export async function refreshProjectProgress(projectId) {
  const tasks = await Task.find({ project: projectId }).select('status');
  if (!tasks.length) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return 0;
  }
  const done = tasks.filter((task) => task.status === 'Done').length;
  const progress = Math.round((done / tasks.length) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });
  return progress;
}
