export function Tooltip({ label, children }) {
  return (
    <span title={label} style={{ display: 'inline-flex' }}>
      {children}
    </span>
  );
}
