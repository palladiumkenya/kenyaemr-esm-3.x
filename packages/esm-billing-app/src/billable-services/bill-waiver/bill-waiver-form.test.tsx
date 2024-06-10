import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BillWaiverForm from './bill-waiver-form.component';
import { processBillPayment } from '../../billing.resource';
import { mockBill, mockLineItems, mockPaymentModes } from '../../../../../__mocks__/bills.mock';

jest.mock('../../billing-form/billing-form.resource', () => ({
  useBillableItems: jest.fn().mockReturnValue({
    lineItems: mockLineItems,
    isLoading: false,
    error: undefined,
  }),
}));

jest.mock('../../invoice/payments/payment.resource', () => ({
  usePaymentModes: jest.fn().mockReturnValue({
    paymentModes: mockPaymentModes,
    isLoading: false,
    error: undefined,
  }),
}));

jest.mock('../../billing.resource', () => ({
  processBillPayment: jest.fn(),
}));

describe('BillWaiverForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the form correctly', () => {
    render(<BillWaiverForm bill={mockBill} lineItems={mockLineItems} setPatientUuid={jest.fn()} />);

    expect(screen.getByLabelText('Waiver form')).toBeInTheDocument();
    expect(screen.getByText('Bill Items')).toBeInTheDocument();
    expect(screen.getByText('Ksh 650.00')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount to Waive')).toBeInTheDocument();
    expect(screen.getByText('Post waiver')).toBeInTheDocument();
  });

  test('should update waiver amount when input value changes', () => {
    render(<BillWaiverForm bill={mockBill} lineItems={mockLineItems} setPatientUuid={jest.fn()} />);

    const waiverAmountInput = screen.getByLabelText('Enter amount to waive');
    fireEvent.change(waiverAmountInput, { target: { value: '750' } });

    expect(waiverAmountInput.value).toBe('750');
  });

  test('should call processBillPayment when "Post waiver" button is clicked', () => {
    render(<BillWaiverForm bill={mockBill} lineItems={mockLineItems} setPatientUuid={jest.fn()} />);

    const postWaiverButton = screen.getByText('Post waiver');
    fireEvent.click(postWaiverButton);

    expect(processBillPayment).toHaveBeenCalledTimes(1);
  });
});
