import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentModeWorkspace from './payment-mode.workspace';
import userEvent from '@testing-library/user-event';
import { createPaymentMode } from './payment-mode.resource';
import { showSnackbar } from '@openmrs/esm-framework';

const testProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
};

const mockCreatePaymentMode = jest.mocked(createPaymentMode);

jest.mock('./payment-mode.resource', () => ({
  ...jest.requireActual('./payment-mode.resource'),
  createPaymentMode: jest.fn(),
}));

describe('PaymentModeWorkspace', () => {
  test('should validate and submit correct form payload', async () => {
    const user = userEvent.setup();
    render(<PaymentModeWorkspace {...testProps} />);
    const nameInput = screen.getByRole('textbox', { name: /Payment mode name/i });
    const descriptionInput = screen.getByRole('textbox', { name: /Payment mode description/i });
    const submitButton = screen.getByRole('button', { name: /Save & Close/i });

    await user.click(submitButton);

    // Should show validation error
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();

    await user.type(nameInput, 'Test Name');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);

    // should not show validation error
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/description is required/i)).not.toBeInTheDocument();

    // should call createPaymentMode
    expect(mockCreatePaymentMode).toHaveBeenCalledWith({ description: 'Test Description', name: 'Test Name' }, '');
  });

  test('should show error message when submitting form fails', async () => {
    const user = userEvent.setup();
    mockCreatePaymentMode.mockRejectedValue({
      responseBody: {
        error: {
          message: 'An error occurred while creating the payment mode',
        },
      },
    });
    render(<PaymentModeWorkspace {...testProps} />);
    const nameInput = screen.getByRole('textbox', { name: /Payment mode name/i });
    const descriptionInput = screen.getByRole('textbox', { name: /Payment mode description/i });
    const submitButton = screen.getByRole('button', { name: /Save & Close/i });

    await user.type(nameInput, 'Test Name');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);

    // should show error message
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'Payment mode creation failed',
      subtitle: 'An error occurred while creating the payment mode {{errorMessage}}',
      kind: 'error',
      isLowContrast: true,
    });
  });
});
