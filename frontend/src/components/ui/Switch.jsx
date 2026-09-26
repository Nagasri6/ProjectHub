import styles from './ui.module.css';

export function Switch({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`${styles.switch} ${checked ? styles.switchOn : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.switchThumb} />
      </button>
    </label>
  );
}
