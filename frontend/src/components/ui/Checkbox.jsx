export function Checkbox({ label, ...props }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

export function Radio({ label, ...props }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <input type="radio" {...props} />
      {label}
    </label>
  );
}
