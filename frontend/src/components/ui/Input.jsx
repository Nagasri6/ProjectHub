import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import styles from './ui.module.css';

export const Input = forwardRef(function Input({ label, error, id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <label className={styles.field} htmlFor={inputId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input id={inputId} ref={ref} className={styles.control} aria-invalid={Boolean(error)} {...props} />
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </label>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <label className={styles.field} htmlFor={inputId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea id={inputId} ref={ref} className={styles.textarea} {...props} />
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </label>
  );
});

export const Select = forwardRef(function Select({ label, error, id, children, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <label className={styles.field} htmlFor={inputId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <select id={inputId} ref={ref} className={styles.select} {...props}>
        {children}
      </select>
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </label>
  );
});

export function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <label className={`${styles.searchInput} ${className || ''}`}>
      <Search size={16} aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
