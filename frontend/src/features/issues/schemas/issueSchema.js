import { z } from 'zod';

export const issueSchema = z.object({
  title: z.string().min(3, 'Issue title is required'),
  description: z.string().min(6, 'Describe the issue'),
  project: z.string().min(1, 'Select a project'),
  assignee: z.string().optional(),
  status: z.enum(['Open', 'In Progress', 'Waiting', 'Resolved', 'Closed']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  dueDate: z.string().optional(),
});
