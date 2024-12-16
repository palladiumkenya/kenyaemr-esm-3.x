import React from 'react';
import { render, screen } from '@testing-library/react';
import PromptPaymentModal from './prompt-payment-modal.component';
import { useBillingPrompt } from './prompt-payment.resource';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { PaymentStatus } from '../types';
import userEvent from '@testing-library/user-event';

const mockNavigate = navigate as jest.MockedFunction<typeof navigate>;

const mockMappedBill = [
  {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    id: 1,
    patientUuid: 'patient-uuid-123',
    patientName: 'John Doe',
    cashPointUuid: 'cashpoint-uuid-123',
    cashPointName: 'Main Reception',
    cashPointLocation: 'Hospital Wing A',
    cashier: {
      uuid: 'cashier-uuid-123',
      display: 'Dr. Jane Smith',
      links: [
        {
          rel: 'self',
          uri: 'http://example.com/provider/cashier-uuid-123',
          resourceAlias: 'provider',
        },
      ],
    },
    receiptNumber: 'REC-2023-001',
    status: PaymentStatus.PENDING,
    identifier: 'BILL-001',
    dateCreated: '2023-08-15T10:30:00.000Z',
    dateCreatedUnformatted: '2023-08-15',
    lineItems: [
      {
        uuid: 'lineitem-uuid-123',
        display: 'Consultation Fee',
        voided: false,
        voidReason: null,
        item: 'Consultation',
        billableService: 'some-uuid:General Consultation',
        quantity: 1,
        price: 50.0,
        priceName: 'Standard Price',
        priceUuid: 'price-uuid-123',
        lineItemOrder: 1,
        resourceVersion: '1.0',
        paymentStatus: 'PENDING',
        itemOrServiceConceptUuid: 'concept-uuid-123',
        serviceTypeUuid: 'service-type-uuid-123',
        order: {
          uuid: 'order-uuid-123',
        },
      },
    ],
    billingService: 'Outpatient Services',
    payments: [
      {
        uuid: 'payment-uuid-123',
        instanceType: {
          uuid: 'instance-type-uuid-123',
          name: 'Cash Payment',
          description: 'Standard cash payment',
          retired: false,
        },
        attributes: [],
        amount: 50.0,
        amountTendered: 50.0,
        dateCreated: 1692093000000, // Unix timestamp for 2023-08-15T10:30:00.000Z
        voided: false,
        resourceVersion: '1.0',
      },
    ],
    totalAmount: 50.0,
    tenderedAmount: 50.0,
    display: 'Bill #BILL-001',
    referenceCodes: 'REF-001',
    adjustmentReason: undefined,
  },
];

const mockUseBillingPrompt = useBillingPrompt as jest.MockedFunction<typeof useBillingPrompt>;
const mockUseConfig = useConfig as jest.MockedFunction<typeof useConfig>;
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  getPatientUuidFromStore: jest.fn(() => 'patient-uuid'),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  navigate: jest.fn(),
}));

jest.mock('./prompt-payment.resource', () => ({
  useBillingPrompt: jest.fn(),
}));

describe('<PromptPaymentModal />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should show the prompt payment modal, when `shouldShowBillingPrompt` is true and `enforceBillPayment` is true', async () => {
    const user = userEvent.setup();
    mockUseBillingPrompt.mockReturnValue({
      shouldShowBillingPrompt: true,
      isLoading: false,
      bills: mockMappedBill,
      currentVisit: null,
      error: null,
    });
    mockUseConfig.mockReturnValue({
      enforceBillPayment: true,
    });
    render(<PromptPaymentModal />);
    expect(screen.getByText('Patient Billing Alert')).toBeInTheDocument();
    expect(
      screen.getByText('The current patient has pending bill. Advice patient to settle bill.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Navigate back')).toBeInTheDocument();
    // check if the structured list is rendered
    const structuredListHeaders = ['Item', 'Quantity', 'Unit price', 'Total'];
    structuredListHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    // clicking cancel button should close the modal
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledWith({ to: `\${openmrsSpaBase}/home` });
    // clicking proceed to care button should close the modal
    const navigateBackButton = screen.getByText('Navigate back');
    await user.click(navigateBackButton);
    expect(mockNavigate).toHaveBeenCalledWith({ to: `\${openmrsSpaBase}/home` });
  });

  test('should show the prompt payment modal, when `shouldShowBillingPrompt` is true and `enforceBillPayment` is false and not navigate back', async () => {
    const user = userEvent.setup();
    mockUseBillingPrompt.mockReturnValue({
      shouldShowBillingPrompt: true,
      isLoading: false,
      bills: mockMappedBill,
      currentVisit: null,
      error: null,
    });
    mockUseConfig.mockReturnValue({
      enforceBillPayment: false,
    });

    render(<PromptPaymentModal />);
    expect(screen.getByText('Patient Billing Alert')).toBeInTheDocument();
    expect(
      screen.getByText('The current patient has pending bill. Advice patient to settle bill.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Proceed to care')).toBeInTheDocument();

    // clicking proceed to care button should close the modal
    const proceedToCareButton = screen.getByText('Proceed to care');
    await user.click(proceedToCareButton);
    expect(mockNavigate).not.toHaveBeenCalled();

    // clicking cancel button should close the modal
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledWith({ to: `\${openmrsSpaBase}/home` });
  });

  test('should show the loading state when `isLoading` is true', () => {
    mockUseBillingPrompt.mockReturnValue({
      shouldShowBillingPrompt: true,
      isLoading: true,
      bills: mockMappedBill,
      currentVisit: null,
      error: null,
    });
    mockUseConfig.mockReturnValue({
      enforceBillPayment: true,
    });
    render(<PromptPaymentModal />);
    expect(screen.getByText('Billing status')).toBeInTheDocument();
    expect(screen.getByText('Verifying patient bills')).toBeInTheDocument();
  });

  test('should not render the modal when `shouldShowBillingPrompt` is false', () => {
    mockUseBillingPrompt.mockReturnValue({
      shouldShowBillingPrompt: false,
      isLoading: false,
      bills: mockMappedBill,
      currentVisit: null,
      error: null,
    });
    mockUseConfig.mockReturnValue({
      enforceBillPayment: true,
    });
    render(<PromptPaymentModal />);
    expect(screen.queryByText('Patient Billing Alert')).not.toBeInTheDocument();
  });
});
