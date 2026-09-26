import { NavLink } from 'react-router-dom';
import styles from './ui.module.css';

export function Tabs({ items }) {
  return (
    <nav className={styles.tabs} aria-label="Section tabs">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
