import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import { ToastStack } from '../../components/feedback/Feedback';

export function AppProviders({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
        <ToastStack />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
