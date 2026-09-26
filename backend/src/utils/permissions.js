export const ROLE_PERMISSIONS = {
  admin: [
    'project:create',
    'project:edit',
    'project:delete',
    'project:view',
    'task:create',
    'task:update',
    'task:delete',
    'task:assign',
    'team:manage',
    'team:view',
    'issue:create',
    'issue:update',
    'issue:delete',
    'file:upload',
    'file:delete',
    'comment:create',
    'reports:view',
    'user:view',
  ],
  developer: [
    'project:view',
    'task:create',
    'task:update',
    'team:view',
    'issue:create',
    'issue:update',
    'file:upload',
    'comment:create',
    'reports:view',
    'user:view',
  ],
};

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
