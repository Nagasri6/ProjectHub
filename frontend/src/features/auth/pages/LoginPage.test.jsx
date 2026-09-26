import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './LoginPage';

function renderLogin() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

test('shows sign in form without credentials', () => {
  renderLogin();
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toHaveValue('');
  expect(screen.getByLabelText('Password')).toHaveValue('');
  expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  expect(screen.getByText('Sign in with your ProjectHub account.')).toBeInTheDocument();
  expect(screen.queryByText(/admin@example.com/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Password123/)).not.toBeInTheDocument();
  expect(screen.queryByText(/README/)).not.toBeInTheDocument();
});

test('toggles password visibility without changing the value or submitting', async () => {
  const user = userEvent.setup();
  renderLogin();
  const password = screen.getByLabelText('Password');
  await user.type(password, 'SecretValue');
  expect(password).toHaveAttribute('type', 'password');

  await user.click(screen.getByRole('button', { name: 'Show password' }));
  expect(password).toHaveAttribute('type', 'text');
  expect(password).toHaveValue('SecretValue');

  await user.click(screen.getByRole('button', { name: 'Hide password' }));
  expect(password).toHaveAttribute('type', 'password');
  expect(password).toHaveValue('SecretValue');
  expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
});
