import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBillableService from './add-billable-service.component';
import {
  usePaymentModes,
  useServiceTypes,
  createBillableService,
  useConceptsSearch,
} from '../billable-service.resource';
import { navigate, showSnackbar } from '@openmrs/esm-framework';

jest.mock('../billable-service.resource', () => ({
  usePaymentModes: jest.fn(),
  useServiceTypes: jest.fn(),
  createBillableService: jest.fn(),
  useConceptsSearch: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  navigate: jest.fn(),
  showSnackbar: jest.fn(),
}));

const mockPaymentModes = [
  { uuid: '63eff7a4-6f82-43c4-a333-dbcc58fe9f74', name: 'Cash', description: 'Cash Payment', retired: false },
  {
    uuid: 'beac329b-f1dc-4a33-9e7c-d95821a137a6',
    name: 'Insurance',
    description: 'Insurance method of payment',
    retired: false,
  },
  {
    uuid: '28989582-e8c3-46b0-96d0-c249cb06d5c6',
    name: 'MPESA',
    description: 'Mobile money method of payment',
    retired: false,
  },
];

const mockServiceTypes = [
  { uuid: 'c9604249-db0a-4d03-b074-fc6bc2fa13e6', display: 'Lab service' },
  { uuid: 'b75e466f-a6f5-4d5e-849a-84424d3c85cd', display: 'Pharmacy service' },
  { uuid: 'ce914b2d-44f6-4b6c-933f-c57a3938e35b', display: 'Peer educator service' },
  { uuid: 'c23d3224-2218-4007-8f22-e1f3d5a8e58a', display: 'Nutrition service' },
  { uuid: '65487ff4-63b3-452a-8985-6a1f4a0cc08d', display: 'TB service' },
  { uuid: '9db142d5-5cc4-4c05-9f83-06ed294caa67', display: 'Family planning service' },
  { uuid: 'a487a743-62ce-4f93-a66b-c5154ee8987d', display: 'Adherence counselling  service' },
];

const mockConcepts = [
  {
    concept: { uuid: 'c9604249-db0a-4d03-b074-fc6bc2fa13e6', display: 'Lab Test' },
    conceptName: { uuid: 'c9604249-db0a-4d03-b074-fc6bc2fa1334', display: 'Lab Test' },
    display: 'Lab Test',
  },
];

describe('AddBillableService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePaymentModes as jest.Mock).mockReturnValue({ paymentModes: mockPaymentModes, isLoading: false });
    (useServiceTypes as jest.Mock).mockReturnValue({ serviceTypes: mockServiceTypes, isLoading: false });
    (useConceptsSearch as jest.Mock).mockReturnValue({ searchResults: mockConcepts, isSearching: false });
    (createBillableService as jest.Mock).mockResolvedValue({ status: 201, ok: true });
  });

  it('should render and submit the form correctly', async () => {
    render(<AddBillableService />);

    // Fill out the form
    await userEvent.type(screen.getByLabelText(/Service Name/i), 'Test Service');
    await userEvent.type(screen.getByLabelText(/Short Name/i), 'TST');

    // Search for concept
    const conceptSearch = screen.getByPlaceholderText(/Search associated concept/i);
    await userEvent.type(conceptSearch, 'Lab Test');
    await waitFor(() => {
      const conceptOption = screen.getByText('Lab Test');
      userEvent.click(conceptOption);
    });

    // Select service type
    const serviceTypeCombobox = screen.getByLabelText(/Service Type/i);
    await userEvent.click(serviceTypeCombobox);
    const labServiceOption = await screen.findByText('Lab service');
    await userEvent.click(labServiceOption);

    // Add payment option
    const addPaymentButton = screen.getByRole('button', { name: /Add payment option/i });
    await userEvent.click(addPaymentButton);

    // Select payment mode
    const paymentModeDropdown = screen.getByText(/Select payment method/i);
    await userEvent.click(paymentModeDropdown);
    const cashOption = await screen.findByText('Cash');
    await userEvent.click(cashOption);

    // Enter price
    const priceInput = screen.getByLabelText(/Selling Price/i);
    await userEvent.type(priceInput, '1000');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    expect(submitButton).toBeInTheDocument();
    await userEvent.click(submitButton);

    // Check if createBillableService was called with the correct data
    await waitFor(() => {
      expect(createBillableService).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Service',
          shortName: 'TST',
          serviceType: expect.any(String),
          servicePrices: [
            expect.objectContaining({
              name: 'Cash',
              price: '1000',
              paymentMode: '63eff7a4-6f82-43c4-a333-dbcc58fe9f74',
            }),
          ],
          concept: 'c9604249-db0a-4d03-b074-fc6bc2fa13e6',
        }),
      );
    });

    // Check if navigation occurred after successful submission
    expect(navigate).toHaveBeenCalledWith({ to: `${window.getOpenmrsSpaBase()}billable-services` });
  });

  it('should navigate back to billable services dashboard when Cancel button is clicked', async () => {
    render(<AddBillableService />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeInTheDocument();
    await userEvent.click(cancelButton);

    expect(navigate).toHaveBeenCalledWith({ to: `${window.getOpenmrsSpaBase()}billable-services` });
  });
});
