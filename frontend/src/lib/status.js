export const projectStatusVariant = {
  Planning: 'neutral',
  'In Progress': 'info',
  'On Track': 'success',
  'At Risk': 'warning',
  Completed: 'success',
};

export const taskStatusVariant = {
  'To Do': 'neutral',
  'In Progress': 'info',
  Review: 'warning',
  Done: 'success',
};

export const priorityVariant = {
  Low: 'info',
  Medium: 'warning',
  High: 'danger',
  Urgent: 'danger',
  Critical: 'danger',
};

export const issueStatusVariant = {
  Open: 'danger',
  'In Progress': 'info',
  Waiting: 'warning',
  Resolved: 'success',
  Closed: 'neutral',
};

export const PROJECT_STATUSES = ['Planning', 'In Progress', 'On Track', 'At Risk', 'Completed'];
export const TASK_STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const ISSUE_STATUSES = ['Open', 'In Progress', 'Waiting', 'Resolved', 'Closed'];
export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
