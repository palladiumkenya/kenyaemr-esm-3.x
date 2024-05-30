import React from 'react';
import { render, screen } from '@testing-library/react';
import RequirePaymentModal from './require-payment-modal.component';
import { useBills } from '../billing.resource';
import { mockBills, mockCurrentVisit } from '../../__mocks__/visit.mock';
import { useVisit } from '@openmrs/esm-framework';

const mockUseVisit = useVisit as jest.Mock;
const mockUseBills = useBills as jest.MockedFunction<typeof useBills>;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn().mockReturnValue({
    visitAttributeTypes: {
      isPatientExempted: '3b9dfac8-9e4d-11ee-8c90-0242ac120002',
      paymentMethods: 'e6cb0c3b-04b0-4117-9bc6-ce24adbda802',
      insuranceScheme: '2d0fa959-6780-41f1-85b1-402045935068',
      policyNumber: '0f4f3306-f01b-43c6-af5b-fdb60015cb02',
      exemptionCategory: 'df0362f9-782e-4d92-8bb2-3112e9e9eb3c',
      billPaymentStatus: '919b51c9-8e2e-468f-8354-181bf3e55786',
    },
    patientExemptionCategories: [{ value: 'IN_PRISON', label: 'In Prison' }],
    excludedPaymentMode: [],
    enforceBillPayment: true,
    'Display conditions': { privileges: [] },
    'Translation overrides': {},
  }),
  useVisit: jest.fn(),
}));

jest.mock('../billing.resource', () => ({
  useBills: jest.fn(),
}));
describe('RequirePaymentModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading modal when bill status is loading', () => {
    mockUseBills.mockReturnValueOnce({
      isLoading: true,
      bills: [],
      isValidating: false,
      mutate: jest.fn(),
      error: null,
    });
    mockUseVisit.mockReturnValueOnce({
      isLoading: false,
      currentVisit: mockCurrentVisit,
      isValidating: false,
      error: null,
      activeVisit: mockCurrentVisit,
      mutate: jest.fn(),
      currentVisitIsRetrospective: false,
    });
    renderRequirePaymentModal();
    expect(screen.getByText('Billing status')).toBeInTheDocument();
    expect(screen.getByText('Verifying patient bills')).toBeInTheDocument();
  });

  test('should not show billing prompt if the patient has an inpatient visit', () => {
    mockUseBills.mockReturnValueOnce({
      isLoading: false,
      bills: mockBills as any,
      isValidating: false,
      mutate: jest.fn(),
      error: {},
    });
    mockUseVisit.mockReturnValueOnce({
      isLoading: false,
      currentVisit: mockCurrentVisit,
      isValidating: false,
      error: null,
      activeVisit: mockCurrentVisit,
      mutate: jest.fn(),
      currentVisitIsRetrospective: false,
    });
    renderRequirePaymentModal();
    expect(screen.queryByText('Billing status')).not.toBeInTheDocument();
  });
});

function renderRequirePaymentModal() {
  return render(<RequirePaymentModal />);
}
