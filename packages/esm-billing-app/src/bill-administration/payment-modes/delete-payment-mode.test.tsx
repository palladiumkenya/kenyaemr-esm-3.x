import React from 'react';
import { render, screen } from '@testing-library/react';
import DeletePaymentModeModal from './delete-payment-mode.modal';
import userEvent from '@testing-library/user-event';
import { PaymentMode } from '../types';
import { deletePaymentMode } from './payment-mode.resource';

const mockDeletePaymentMode = jest.mocked(deletePaymentMode);

jest.mock('./payment-mode.resource', () => ({
  deletePaymentMode: jest.fn(),
}));

describe('DeletePaymentModeModal', () => {
  test('should be able to delete payment mode when user clicks on delete button', async () => {
    const user = userEvent.setup();
    const mockCloseModal = jest.fn();
    const mockPaymentMode = {
      uuid: '123',
      name: 'Test Payment Mode',
      description: 'Test Description',
      retired: false,
      auditInfo: {
        creator: {
          uuid: '456',
          display: 'Test Creator',
        },
        dateCreated: '2021-01-01',
      },
    } as PaymentMode;

    render(<DeletePaymentModeModal closeModal={mockCloseModal} paymentMode={mockPaymentMode} />);

    const deleteButton = await screen.findByRole('button', { name: /Delete/i });
    await user.click(deleteButton);

    expect(mockDeletePaymentMode).toHaveBeenCalledWith(mockPaymentMode.uuid);
  });

  test('should be able to cancel deletion of payment mode when user clicks on cancel button', async () => {
    const user = userEvent.setup();
    const mockCloseModal = jest.fn();
    const mockPaymentMode = {
      uuid: '123',
      name: 'Test Payment Mode',
      description: 'Test Description',
    } as PaymentMode;

    render(<DeletePaymentModeModal closeModal={mockCloseModal} paymentMode={mockPaymentMode} />);

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });
});
