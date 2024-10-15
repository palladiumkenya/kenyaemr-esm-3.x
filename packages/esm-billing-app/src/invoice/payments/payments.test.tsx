import React from 'react';
import { render, screen } from '@testing-library/react';
import Payments from './payments.component';
import { mockBill, mockLineItems, mockPaymentModes } from '../../../../../__mocks__/bills.mock';
import { processBillPayment, usePaymentModes } from '../../billing.resource';
import userEvent from '@testing-library/user-event';
import { showSnackbar } from '@openmrs/esm-framework';

const mockProcessBillPayment = processBillPayment as jest.MockedFunction<typeof processBillPayment>;
const mockUsePaymentModes = usePaymentModes as jest.MockedFunction<typeof usePaymentModes>;
const mockShowSnackbar = showSnackbar as jest.MockedFunction<typeof showSnackbar>;

jest.mock('../../billing.resource', () => ({
  processBillPayment: jest.fn(),
  usePaymentModes: jest.fn(),
}));

describe('Payment', () => {
  test('should display error when posting payment fails', async () => {
    const user = userEvent.setup();
    const mockFieldErrorResponse = {
      responseBody: {
        error: {
          message: 'Invalid Submission',
          code: 'webservices.rest.error.invalid.submission',
          globalErrors: [],
          fieldErrors: {},
        },
      },
    };
    mockProcessBillPayment.mockRejectedValueOnce(mockFieldErrorResponse);
    mockUsePaymentModes.mockReturnValue({
      paymentModes: mockPaymentModes,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
    render(<Payments bill={mockBill as any} selectedLineItems={mockLineItems} />);
    const addPaymentMethod = screen.getByRole('button', { name: /Add payment option/i });
    await user.click(addPaymentMethod);
    await user.click(screen.getByRole('combobox', { name: /Payment method/i }));
    const cashOption = screen.getByRole('option', { name: /Cash/i });
    await user.click(cashOption);

    const amountInput = screen.getByRole('spinbutton', { name: /Amount/i });
    await user.type(amountInput, '100');

    const submitButton = screen.getByRole('button', { name: /Process Payment/i });
    await user.click(submitButton);

    expect(mockProcessBillPayment).toHaveBeenCalledTimes(1);
    expect(mockProcessBillPayment).toHaveBeenCalledWith(
      {
        cashPoint: '54065383-b4d4-42d2-af4d-d250a1fd2590',
        cashier: 'fe00dd43-4c39-4ce9-9832-bc3620c80c6c',
        lineItems: [
          {
            billableService: 'Hemoglobin',
            display: 'BillLineItem',
            item: 'Hemoglobin',
            lineItemOrder: 0,
            paymentStatus: 'PAID',
            price: 100,
            priceName: '',
            priceUuid: '',
            quantity: 1,
            resourceVersion: '1.8',
            uuid: '053ab483-79de-43f9-a73b-5823ccd8518b',
            voidReason: null,
            voided: false,
          },
        ],
        patient: 'b2fcf02b-7ee3-4d16-a48f-576be2b103aa',
        payments: [
          {
            amount: 100,
            amountTendered: 100,
            attributes: [],
            instanceType: '63eff7a4-6f82-43c4-a333-dbcc58fe9f74',
          },
        ],
        status: 'PAID',
      },
      '6eb8d678-514d-46ad-9554-51e48d96d567',
    );

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Bill payment failed',
      subtitle:
        'An unexpected error occurred while processing your bill payment. Please contact the system administrator and provide them with the following error details: Invalid Submission',
      kind: 'error',
      timeoutInMs: 3000,
      isLowContrast: true,
    });
  });

  test('should automatically focus on the payment method field when user clicks add payment options', async () => {
    const user = userEvent.setup();
    mockUsePaymentModes.mockReturnValue({
      paymentModes: mockPaymentModes,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
    render(<Payments bill={mockBill as any} selectedLineItems={mockLineItems} />);
    const addPaymentMethod = screen.getByRole('button', { name: /Add payment option/i });
    await user.click(addPaymentMethod);

    // Check if the payment method field is focused
    expect(screen.getByRole('combobox', { name: /Payment method/i })).toHaveFocus();
    await user.click(screen.getByRole('combobox', { name: /Payment method/i }));
    const cashOption = screen.getByRole('option', { name: /Cash/i });
    await user.click(cashOption);
    // Check if the amount field is focused
    expect(screen.getByRole('spinbutton', { name: /Amount/i })).toHaveFocus();
    const amountInput = screen.getByRole('spinbutton', { name: /Amount/i });
    await user.type(amountInput, '100');
  });
});
