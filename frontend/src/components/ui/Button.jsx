import { cn } from '../../lib/cn';
import styles from './ui.module.css';

const variants = {
  primary: styles.button,
  secondary: `${styles.button} ${styles.buttonSecondary}`,
  ghost: `${styles.button} ${styles.buttonGhost}`,
  danger: `${styles.button} ${styles.buttonDanger}`,
  soft: `${styles.button} ${styles.buttonSoft}`,
};

export function Button({ variant = 'primary', size, className, children, ...props }) {
  return (
    <button
      className={cn(variants[variant], size === 'sm' && styles.buttonSm, size === 'lg' && styles.buttonLg, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ className, badge, children, ...props }) {
  return (
    <button className={cn(styles.iconButton, className)} {...props}>
      {children}
      {badge ? (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#ef4444',
          }}
        />
      ) : null}
    </button>
  );
}
