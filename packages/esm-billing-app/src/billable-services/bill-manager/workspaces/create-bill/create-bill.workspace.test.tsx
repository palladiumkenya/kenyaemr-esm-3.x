import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type Order, type OrderAction } from '@openmrs/esm-patient-common-lib';
import { processBillItems } from '../../../../billing.resource';
import CreateBillWorkspace from './create-bill.workspace';
import { useBillableItem } from '../../../billiable-item/useBillableItem';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultText, options) => {
      if (options) {
        return defaultText.replace(/\{\{(\w+)\}\}/g, (_, key) => options[key] || '');
      }
      return defaultText || key;
    },
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  useLayoutType: jest.fn(),
  showSnackbar: jest.fn(),
  ResponsiveWrapper: ({ children }) => <div>{children}</div>,
  restBaseUrl: '/openmrs/ws/rest/v1',
}));

jest.mock('../../../billiable-item/useBillableItem', () => ({
  useBillableItem: jest.fn(),
}));

jest.mock('../../../../billing.resource', () => ({
  processBillItems: jest.fn(),
}));

jest.mock('swr', () => ({
  mutate: jest.fn(),
}));

describe('CreateBillWorkspace', () => {
  // Mock data
  const mockOrder: Order = {
    uuid: 'order-uuid',
    orderNumber: 'ORD-123',
    concept: {
      uuid: 'concept-uuid',
      display: 'Test Service',
    },
    action: 'NEW' as OrderAction,
    asNeeded: false,
    autoExpireDate: null,
    careSetting: {
      uuid: 'care-setting-uuid',
      display: 'Outpatient',
    },
    dateActivated: '2024-01-01',
    dateStopped: null,
    drug: null,
    dosingType: 'org.openmrs.FreeTextDosingInstructions',
    dose: null,
    doseUnits: null,
    frequency: null,
    instructions: null,
    numRefills: 0,
    orderType: {
      uuid: 'order-type-uuid',
      display: 'Test Order Type',
      conceptClasses: [],
      description: 'Test Order Type Description',
      name: 'Test Order Type',
      parent: 'parent-uuid',
      retired: false,
    },
    orderer: {
      uuid: 'orderer-uuid',
      display: 'Test Orderer',
      person: {
        display: 'Test Person',
      },
    },
    previousOrder: null,
    quantity: 1,
    quantityUnits: null,
    route: null,
    scheduledDate: null,
    scheduleDate: null,
    numberOfRepeats: '0',
    urgency: 'ROUTINE',
    accessionNumber: null,
    auditInfo: {
      creator: {
        uuid: 'creator-uuid',
        display: 'Test Creator',
      },
      dateCreated: '2024-01-01',
      changedBy: null,
      dateChanged: null,
    },
    fulfillerStatus: null,
    fulfillerComment: null,
    specimenSource: null,
    laterality: null,
    clinicalHistory: null,
    commentToFulfiller: null,
    display: 'Test Order',
    type: 'order',
    dispenseAsWritten: false,
    dosingInstructions: null,
    duration: null,
    durationUnits: null,
    brandName: null,
    orderReason: null,
    orderReasonNonCoded: null,
    encounter: {
      uuid: 'encounter-uuid',
      display: 'Test Encounter',
    },
    patient: {
      uuid: 'patient-uuid',
      display: 'Test Patient',
    },
  };

  const mockBillableItem = {
    uuid: 'billable-uuid',
    name: 'Test Service',
    servicePrices: [
      {
        uuid: 'price-uuid-1',
        price: 100,
        paymentMode: { name: 'Cash' },
      },
      {
        uuid: 'price-uuid-2',
        price: 150,
        paymentMode: { name: 'Insurance' },
      },
    ],
  };

  const defaultProps = {
    patientUuid: 'patient-uuid',
    order: mockOrder,
    closeWorkspace: jest.fn(),
    closeWorkspaceWithSavedChanges: jest.fn(),
    promptBeforeClosing: jest.fn(),
    setTitle: jest.fn(),
    closeModal: jest.fn(),
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    (useConfig as jest.Mock).mockReturnValue({
      cashPointUuid: 'cash-point-uuid',
      cashierUuid: 'cashier-uuid',
    });

    (useLayoutType as jest.Mock).mockReturnValue('desktop');

    (useBillableItem as jest.Mock).mockReturnValue({
      billableItem: mockBillableItem,
      isLoading: false,
    });

    (processBillItems as jest.Mock).mockResolvedValue({});
  });

  test('renders the form with correct initial state', async () => {
    render(<CreateBillWorkspace {...defaultProps} />);

    // Check that the title and description are rendered
    expect(screen.getByText(/Create bill for order Test Service/)).toBeInTheDocument();
    expect(screen.getByText(/Order Bill Creation ORD-123/)).toBeInTheDocument();

    // Check form elements are rendered
    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    expect(quantityInput).toHaveValue(1);

    const priceDropdown = screen.getByRole('combobox', { name: /Unit Price/i });
    expect(priceDropdown).toBeInTheDocument();
  });

  test('submits the form successfully', async () => {
    const user = userEvent.setup();

    render(<CreateBillWorkspace {...defaultProps} />);

    // Get form elements
    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    const priceDropdown = screen.getByRole('combobox', { name: /Unit Price/i });

    // Set quantity
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    // Open and select from dropdown
    await user.click(priceDropdown);

    // Since Carbon dropdown items might be rendered in a portal or with complex structure,
    // we need to find them by their text content regardless of their exact structure
    const dropdownItem = await screen.findByText(/Cash - Ksh 100.00/);
    await user.click(dropdownItem);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save & close/i });

    // Wait for button to be enabled after form validation
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);
  });

  test('handles loading state correctly', () => {
    // Mock loading state
    (useBillableItem as jest.Mock).mockReturnValue({
      billableItem: null,
      isLoading: true,
    });

    render(<CreateBillWorkspace {...defaultProps} />);

    expect(screen.getByText(/Loading billable items/i)).toBeInTheDocument();
  });

  test('handles form errors correctly', async () => {
    const user = userEvent.setup();

    // Mock API error
    const mockError = new Error('Failed to process bill');
    (processBillItems as jest.Mock).mockRejectedValue(mockError);

    render(<CreateBillWorkspace {...defaultProps} />);

    // Fill form
    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    const priceDropdown = screen.getByRole('combobox', { name: /Unit Price/i });

    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    await user.click(priceDropdown);
    const dropdownItem = await screen.findByText(/Cash - Ksh 100.00/);
    await user.click(dropdownItem);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save & close/i });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);
  });

  test('cancel button closes workspace', async () => {
    const user = userEvent.setup();

    render(<CreateBillWorkspace {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.closeWorkspace).toHaveBeenCalled();
  });
});
