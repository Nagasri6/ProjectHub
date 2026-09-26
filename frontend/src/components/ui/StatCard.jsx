import styles from './ui.module.css';

export function StatCard({ label, value, meta, icon, iconColor = '#6366F1', iconBg = '#EEF2FF' }) {
  return (
    <article className={styles.statCard}>
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{String(value).padStart(2, '0')}</div>
        {meta ? <div className={styles.statMeta}>{meta}</div> : null}
      </div>
      <div className={styles.statIcon} style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
    </article>
  );
}
