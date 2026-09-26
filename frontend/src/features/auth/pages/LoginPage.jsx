import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Hexagon } from 'lucide-react';
import { loginSchema } from '../schemas/loginSchema';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/feedback/Feedback';
import styles from '../../../components/ui/ui.module.css';

export function LoginPage() {
  const { login } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'linear-gradient(180deg, #eef2ff 0%, #f5f7fb 40%)',
      }}
    >
      <div style={{ width: 'min(420px, 100%)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary)', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Hexagon size={18} />
          </span>
          <strong>ProjectHub</strong>
        </div>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Sign in</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 20 }}>Project Management Workspace</p>
        {login.error ? <Alert variant="error">{login.error.message}</Alert> : null}
        <form onSubmit={handleSubmit((values) => login.mutate(values))} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <label className={styles.field} htmlFor="password">
            <span className={styles.label}>Password</span>
            <span style={{ position: 'relative', display: 'block' }}>
              <input
                id="password"
                className={styles.control}
                type={passwordVisible ? 'text' : 'password'}
                aria-invalid={Boolean(errors.password)}
                style={{ paddingRight: 42 }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                title={passwordVisible ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 32,
                  height: 32,
                  border: 0,
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {passwordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </span>
            {errors.password ? <span className={styles.errorText}>{errors.password.message}</span> : null}
          </label>
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Signing in...' : 'Continue'}
          </Button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Sign in with your ProjectHub account.
        </p>
      </div>
    </div>
  );
}
