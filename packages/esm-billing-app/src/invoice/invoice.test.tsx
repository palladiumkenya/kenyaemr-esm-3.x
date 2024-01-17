import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Invoice from './invoice.component';
import { useBill, processBillPayment } from '../billing.resource';

import { mockPayments, mockedBill } from '../../../../__mocks__/bills.mock';
import { usePaymentModes, updateBillVisitAttribute } from './payments/payment.resource';
import { showSnackbar, usePatient } from '@openmrs/esm-framework';

const mockBill = useBill as jest.MockedFunction<typeof useBill>;
const mockUsePaymentModes = usePaymentModes as jest.MockedFunction<typeof usePaymentModes>;
const mockProcessBillPayment = processBillPayment as jest.MockedFunction<typeof processBillPayment>;
const mockUsePatient = usePatient as jest.MockedFunction<typeof usePatient>;
const mockUpdateBillVisitAttribute = updateBillVisitAttribute as jest.MockedFunction<typeof updateBillVisitAttribute>;

jest.mock('./payments/payment.resource', () => ({
  usePaymentModes: jest.fn(),
  updateBillVisitAttribute: jest.fn(),
}));

jest.mock('../billing.resource', () => ({
  useBill: jest.fn(),
  processBillPayment: jest.fn(),
  useDefaultFacility: jest.fn().mockReturnValue({ uuid: '54065383-b4d4-42d2-af4d-d250a1fd2590', display: 'MTRH' }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ patientUuid: 'patientUuid', billUuid: 'billUuid' }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  usePatient: jest.fn(),
}));

describe('Invoice', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('should render Invoice component', async () => {
    const user = userEvent.setup();
    mockBill.mockReturnValue({
      bill: mockedBill,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockUsePaymentModes.mockReturnValue({
      paymentModes: [
        { uuid: 'uuid', name: 'Cash', description: 'Cash Method', retired: false },
        { uuid: 'uuid1', name: 'MPESA', description: 'MPESA Method', retired: false },
      ],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
    mockUsePatient.mockReturnValue({
      patient: {
        id: 'b2fcf02b-7ee3-4d16-a48f-576be2b103aa',
        name: [{ given: ['John'], family: 'Doe' }],
      },
      patientUuid: 'b2fcf02b-7ee3-4d16-a48f-576be2b103aa',
      isLoading: false,
      error: null,
    });
    renderInvoice();

    // Invoice details section
    expect(screen.getByRole('heading', { name: 'Total Amount' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Amount Tendered' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Date And Time' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Invoice Status' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Invoice Number' })).toBeInTheDocument();

    const printButton = screen.getByRole('button', { name: 'Print bill' });
    expect(printButton).toBeInTheDocument();

    // Should show the line items table with the correct headers
    const tableHeader = screen.getByRole('heading', { name: 'Line items' });
    expect(tableHeader).toBeInTheDocument();
    expect(screen.getByText('Items to be billed')).toBeInTheDocument();

    const expectedColumnHeaders = [/No/, /Bill item/, /Bill code/, /Status/, /Quantity/, /Price/, /Total/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    // // should be able to search the line items table
    const searchInput = screen.getByPlaceholderText('Search this table');
    expect(searchInput).toBeInTheDocument();
    await user.type(searchInput, 'Hemoglobin');
    expect(screen.getByText('Hemoglobin')).toBeInTheDocument();

    await user.type(searchInput, 'Some random text');
    expect(screen.queryByText('Hemoglobin')).not.toBeInTheDocument();
    expect(screen.getByText('No matching items to display')).toBeInTheDocument();
    await user.clear(searchInput);

    // // should be able to handle payments
    const paymentSection = await screen.findByRole('heading', { name: 'Payments' });
    expect(paymentSection).toBeInTheDocument();

    const addPaymentOptionButton = await screen.findByRole('button', { name: 'Add payment option' });
    expect(addPaymentOptionButton).toBeInTheDocument();
    await user.click(addPaymentOptionButton);
    const paymentModeInput = screen.getByRole('combobox', { name: 'Payment method' });
    expect(paymentModeInput).toBeInTheDocument();
    await user.click(paymentModeInput);

    // // select cash payment mode
    const cashPaymentMode = await screen.findByText('Cash');
    expect(cashPaymentMode).toBeInTheDocument();
    await user.click(cashPaymentMode);

    // // enter payment amount
    const paymentAmountInput = screen.getByPlaceholderText('Enter amount');
    expect(paymentAmountInput).toBeInTheDocument();
    await user.type(paymentAmountInput, '100');

    // // enter payment reference number
    const paymentReferenceNumberInput = screen.getByRole('textbox', { name: /Enter ref. number/ });
    expect(paymentReferenceNumberInput).toBeInTheDocument();
    await user.type(paymentReferenceNumberInput, '123456');

    expect(addPaymentOptionButton).toBeDisabled();

    // // should process payment
    mockProcessBillPayment.mockResolvedValueOnce(Promise.resolve({} as any));
    const processPaymentButton = screen.getByRole('button', { name: 'Process Payment' });
    expect(processPaymentButton).toBeInTheDocument();
    await user.click(processPaymentButton);

    expect(processBillPayment).toHaveBeenCalledTimes(1);
    expect(processBillPayment).toHaveBeenCalledWith(
      {
        cashPoint: '54065383-b4d4-42d2-af4d-d250a1fd2590',
        cashier: 'fe00dd43-4c39-4ce9-9832-bc3620c80c6c',
        patient: 'b2fcf02b-7ee3-4d16-a48f-576be2b103aa',
        payments: [{ amount: 100, amountTendered: 100, attributes: [], instanceType: 'uuid' }],
        status: 'PAID',
      },
      '6eb8d678-514d-46ad-9554-51e48d96d567',
    );
    expect(showSnackbar).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      subtitle: 'Bill payment processing has been successful',
      timeoutInMs: 3000,
      title: 'Bill payment',
    });
  });

  test('should show print preview when print button is clicked', async () => {
    const user = userEvent.setup();
    mockBill.mockReturnValue({
      bill: mockedBill,
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockUsePaymentModes.mockReturnValue({
      paymentModes: [
        { uuid: 'uuid', name: 'Cash', description: 'Cash Method', retired: false },
        { uuid: 'uuid1', name: 'MPESA', description: 'MPESA Method', retired: false },
      ],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
    renderInvoice();

    const printButton = screen.getByRole('button', { name: 'Print bill' });
    expect(printButton).toBeInTheDocument();
    await user.click(printButton);
  });

  test('should show payment history if bill is paid and disable adding more payments', async () => {
    const user = userEvent.setup();
    mockBill.mockReturnValue({
      bill: {
        ...mockedBill,
        status: 'PAID',
        payments: mockPayments,
        tenderedAmount: 100,
      },
      isLoading: false,
      error: null,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockUsePaymentModes.mockReturnValue({
      paymentModes: [
        { uuid: 'uuid', name: 'Cash', description: 'Cash Method', retired: false },
        { uuid: 'uuid1', name: 'MPESA', description: 'MPESA Method', retired: false },
      ],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    renderInvoice();
    const paymentHistorySection = screen.getByRole('heading', { name: 'Payments' });
    expect(paymentHistorySection).toBeInTheDocument();

    const expectedColumnHeaders = [/Date of payment/, /Bill amount/, /Amount tendered/, /Payment method/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const addPaymentOptionButton = await screen.findByRole('button', { name: 'Add payment option' });
    expect(addPaymentOptionButton).toBeInTheDocument();
    expect(addPaymentOptionButton).toBeDisabled();
  });
});

function renderInvoice() {
  return render(<Invoice />);
}
