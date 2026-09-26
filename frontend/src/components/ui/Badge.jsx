import styles from './ui.module.css';

const map = {
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
  info: styles.badgeInfo,
  neutral: styles.badgeNeutral,
  primary: styles.badgePrimary,
};

export function Badge({ variant = 'neutral', children }) {
  return <span className={`${styles.badge} ${map[variant] || map.neutral}`}>{children}</span>;
}
