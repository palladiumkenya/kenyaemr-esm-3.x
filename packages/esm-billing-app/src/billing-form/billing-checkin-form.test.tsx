import React from 'react';
import { screen, render } from '@testing-library/react';
import BillingCheckInForm from './billing-checkin-form.component';
import { useBillableItems, useCashPoint } from './billing-form.resource';
import userEvent from '@testing-library/user-event';

const mockCashPoints = [
  {
    uuid: '54065383-b4d4-42d2-af4d-d250a1fd2590',
    name: 'Cashier 2',
    description: '',
    retired: false,
  },
];

const mockBillableItems = [
  {
    uuid: 'b37dddd6-4490-4bf7-b694-43bf19d04059',
    conceptUuid: '1926AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    conceptName: 'Consultation billable item',
    hasExpiration: false,
    preferredVendorUuid: '359006e7-2669-4204-aee8-27462514b10a',
    preferredVendorName: 'Consolt',
    categoryUuid: '6469ff7e-f8c7-42d6-bff3-ac9605ec99df',
    categoryName: 'Non Drug',
    commonName: 'Consultation',
    acronym: 'CONSULT',
  },
  {
    uuid: 'b47dddd6-4490-4bf7-b694-43bf19d04059',
    conceptUuid: '1926AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    conceptName: 'Lab Testing billable item',
    hasExpiration: false,
    preferredVendorUuid: '359006e7-2669-4204-aee8-27462514b10a',
    preferredVendorName: 'Consolt',
    categoryUuid: '6469ff7e-f8c7-42d6-bff3-ac9605ec99df',
    categoryName: 'Non Drug',
    commonName: 'Lab Testing',
    acronym: 'CONSULT',
  },
];

const mockUseCashPoint = useCashPoint as jest.Mock;
const mockUseBillableItems = useBillableItems as jest.Mock;

jest.mock('./billing-form.resource', () => {
  const actual = jest.requireActual('./billing-form.resource');
  return { ...actual, useBillableItems: jest.fn(), useCashPoint: jest.fn() };
});

const testProps = { patientUuid: 'some-patient-uuid', setBillingInfo: jest.fn() };

describe('BillingCheckInForm', () => {
  test('Should render billing checkin form', () => {
    mockUseBillableItems.mockReturnValueOnce({ lineItems: [], isLoading: false, error: null });
    mockUseCashPoint.mockReturnValueOnce({ cashPoints: [], isLoading: false, error: null });
    renderBillingCheckinForm();
  });

  test('should show the loading spinner while retrieving data', () => {
    mockUseBillableItems.mockReturnValueOnce({ lineItems: [], isLoading: true, error: null });
    mockUseCashPoint.mockReturnValueOnce({ cashPoints: [], isLoading: true, error: null });
    renderBillingCheckinForm();

    expect(screen.getByText(/Loading billing services.../)).toBeInTheDocument();
  });

  test('should show error state when an error occurs while fetching data', () => {
    const error = new Error('Internal server error');
    mockUseBillableItems.mockReturnValueOnce({ lineItems: [], isLoading: false, error });
    mockUseCashPoint.mockReturnValueOnce({ cashPoints: [], isLoading: false, error });
    renderBillingCheckinForm();

    expect(screen.getByText('Bill service error')).toBeInTheDocument();
    expect(screen.getByText('Error loading bill services')).toBeInTheDocument();
  });

  test('should render the form correctly and generate the required payload', async () => {
    const user = userEvent.setup();
    mockUseBillableItems.mockReturnValueOnce({ lineItems: mockBillableItems, isLoading: false, error: null });
    mockUseCashPoint.mockReturnValueOnce({ cashPoints: mockCashPoints, isLoading: false, error: null });
    const { container } = renderBillingCheckinForm();

    expect(screen.getByText('Billing')).toBeInTheDocument();
    const billiableSelect = screen.getByRole('combobox', { name: 'Billable service' });
    expect(billiableSelect).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Billable service' }));

    await user.click(screen.getByText('Lab Testing'));

    expect(testProps.setBillingInfo).toHaveBeenCalled();
    expect(testProps.setBillingInfo).toHaveBeenCalledWith({
      createBillPayload: {
        cashPoint: '54065383-b4d4-42d2-af4d-d250a1fd2590',
        lineItems: [
          {
            item: 'b47dddd6-4490-4bf7-b694-43bf19d04059',
            lineItemOrder: 0,
            paymentStatus: 'PENDING',
            price: 500.00001,
            priceName: 'Default',
            priceUuid: '',
            quantity: 1,
          },
        ],
        patient: 'some-patient-uuid',
        payments: [],
        status: 'PENDING',
      },
      handleCreateBill: expect.anything(),
    });
  });
});

function renderBillingCheckinForm() {
  return render(<BillingCheckInForm {...testProps} />);
}
