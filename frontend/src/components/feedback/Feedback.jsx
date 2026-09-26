import styles from '../ui/ui.module.css';
import { Button } from '../ui/Button';
import { useUiStore } from '../../store/uiStore';

export function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className={styles.empty}>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel ? (
        <div style={{ marginTop: 16 }}>
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}

export function ErrorState({ title = 'Unable to load this page', message, onRetry }) {
  return (
    <div className={styles.empty}>
      <h3>{title}</h3>
      <p>{message || 'Something went wrong while fetching data.'}</p>
      {onRetry ? (
        <div style={{ marginTop: 16 }}>
          <Button onClick={onRetry}>Try again</Button>
        </div>
      ) : null}
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', style }) {
  return <div className={styles.skeleton} style={{ height, width, ...style }} />;
}

export function Alert({ variant = 'info', children }) {
  const map = { error: styles.alertError, success: styles.alertSuccess, info: styles.alertInfo };
  return <div className={`${styles.alert} ${map[variant]}`}>{children}</div>;
}

export function ToastStack() {
  const toasts = useUiStore((state) => state.toasts);
  return (
    <div className={styles.toastStack} role="status">
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast}>
          <strong>{toast.title}</strong>
          {toast.message ? <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{toast.message}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function Spinner() {
  return <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>;
}
