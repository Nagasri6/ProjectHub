import { render, screen } from '@testing-library/react';
import { Badge } from '../../../components/ui/Badge';

test('task priority badge renders', () => {
  render(<Badge variant="danger">High</Badge>);
  expect(screen.getByText('High')).toBeInTheDocument();
});
