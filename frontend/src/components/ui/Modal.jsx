import { useEffect } from 'react';
import styles from './ui.module.css';
import { Button } from './Button';

export function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        {title ? (
          <h2 id="modal-title" style={{ marginBottom: 16, fontSize: 20 }}>
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose, loading }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 20 }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" type="button" onClick={onConfirm} disabled={loading}>
          {loading ? 'Working...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
