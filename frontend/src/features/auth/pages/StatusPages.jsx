import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <h1>Page Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0 16px' }}>The page you are looking for does not exist.</p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <h1>Access Restricted</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0 16px' }}>You do not have permission to view this page.</p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
