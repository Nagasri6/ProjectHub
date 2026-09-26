import { Link } from 'react-router-dom';
import styles from './ui.module.css';

export function PageHeader({ eyebrow, title, subtitle, actions, crumbs }) {
  return (
    <header className={styles.pageHeader}>
      <div>
        {crumbs ? (
          <div className={styles.breadcrumb}>
            {crumbs.map((crumb, index) => (
              <span key={crumb.label}>
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
                {index < crumbs.length - 1 ? ' / ' : ''}
              </span>
            ))}
          </div>
        ) : null}
        {eyebrow ? <div className={styles.breadcrumb}>{eyebrow}</div> : null}
        <h1 style={{ fontSize: 28, letterSpacing: '-0.03em' }}>{title}</h1>
        {subtitle ? <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{subtitle}</p> : null}
      </div>
      {actions ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div> : null}
    </header>
  );
}
