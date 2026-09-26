import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

test('renders a primary button and handles clicks', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Save</Button>);
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onClick).toHaveBeenCalled();
});
