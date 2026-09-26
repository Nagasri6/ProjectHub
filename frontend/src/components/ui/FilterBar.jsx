import styles from './ui.module.css';

export function FilterBar({ children }) {
  return <div className={styles.filterBar}>{children}</div>;
}
