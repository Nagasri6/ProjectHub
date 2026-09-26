import { render, screen } from '@testing-library/react';
import { Input } from './Input';

test('associates a label with the input', () => {
  render(<Input label="Project Name" name="name" />);
  expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
});
