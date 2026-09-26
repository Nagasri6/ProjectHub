import { initials } from '../../lib/format';
import styles from './ui.module.css';

export function Avatar({ name, src, size = 'md' }) {
  const cls = `${styles.avatar} ${size === 'sm' ? styles.avatarSm : ''} ${size === 'lg' ? styles.avatarLg : ''}`;
  if (src) {
    return <img className={cls} src={src} alt={name || 'User avatar'} />;
  }
  return (
    <span className={cls} aria-hidden={!name} title={name}>
      {initials(name || 'U')}
    </span>
  );
}

export function AvatarGroup({ users = [], max = 4 }) {
  const visible = users.slice(0, max);
  const extra = users.length - visible.length;
  return (
    <div className={styles.avatarGroup}>
      {visible.map((user) => (
        <Avatar key={user._id || user.id || user.name} name={user.name} src={user.avatar} size="sm" />
      ))}
      {extra > 0 ? <span className={`${styles.avatar} ${styles.avatarSm}`}>+{extra}</span> : null}
    </div>
  );
}
