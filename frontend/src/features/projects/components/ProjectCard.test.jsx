import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';

test('project status badge shows On Track', () => {
  render(
    <MemoryRouter>
      <Badge variant="success">On Track</Badge>
    </MemoryRouter>,
  );
  expect(screen.getByText('On Track')).toBeInTheDocument();
});
