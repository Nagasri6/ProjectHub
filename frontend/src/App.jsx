import { AppRouter } from './app/router/AppRouter';
import { AuthBootstrap } from './app/providers/AuthBootstrap';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
    </ErrorBoundary>
  );
}
