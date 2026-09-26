import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(3, 'Task title is required'),
  description: z.string().optional(),
  project: z.string().min(1, 'Select a project'),
  assignee: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  phase: z.string().optional(),
});

export const commentSchema = z.object({
  body: z.string().min(2, 'Write a short comment'),
});
