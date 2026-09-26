import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, isPast } from 'date-fns';

export function formatDate(value) {
  if (!value) return '—';
  return format(new Date(value), 'MMM d, yyyy');
}

export function formatRelative(value) {
  if (!value) return '';
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function formatDue(value) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function isOverdue(value, status) {
  if (!value || status === 'Done' || status === 'Resolved' || status === 'Closed') return false;
  return isPast(new Date(value)) && !isToday(new Date(value));
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(name = '') {
  return name.split(' ')[0] || name;
}
