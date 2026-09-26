import { Component } from 'react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
          <div>
            <h1>Something went wrong</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: '8px 0 16px' }}>We could not display this page.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
