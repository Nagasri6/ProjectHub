import { Link } from 'react-router-dom';
import styles from './ui.module.css';

export function Card({ children, className, ...props }) {
  return (
    <section className={`${styles.card} ${className || ''}`} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ title, action, to, actionLabel }) {
  return (
    <div className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {to ? (
        <Link className={styles.link} to={to}>
          {actionLabel || 'View all'}
        </Link>
      ) : (
        action
      )}
    </div>
  );
}

export function ProgressBar({ value = 0 }) {
  return (
    <div className={styles.progress} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.progressBar} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
