import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

test('renders badge text', () => {
  render(<Badge variant="success">On Track</Badge>);
  expect(screen.getByText('On Track')).toBeInTheDocument();
});
