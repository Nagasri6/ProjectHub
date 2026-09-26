import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(3, 'Project name is required'),
  description: z.string().min(8, 'Add a short description'),
  owner: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  targetDate: z.string().min(1, 'Target date is required'),
  status: z.enum(['Planning', 'In Progress', 'On Track', 'At Risk', 'Completed']),
  category: z.string().optional(),
});
