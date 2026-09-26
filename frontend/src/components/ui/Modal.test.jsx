import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

test('closes on escape', async () => {
  const onClose = vi.fn();
  render(
    <Modal open title="Create project" onClose={onClose}>
      <p>Form</p>
    </Modal>,
  );
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalled();
});
