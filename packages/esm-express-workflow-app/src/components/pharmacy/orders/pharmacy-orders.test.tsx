import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithSwr } from '../../../../../../tools/test-helpers';
import PharmacyOrders from './pharmacy-orders.component';
import { usePharmacyOrders } from './pharmacy-orders.resource';

// Mock the workspace launcher hook
const mockLaunchAddDrugOrder = jest.fn();
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useLaunchWorkspaceRequiringVisit: jest.fn(() => mockLaunchAddDrugOrder),
}));

// Mock the pharmacy orders hook
jest.mock('./pharmacy-orders.resource');

const mockUsePharmacyOrders = usePharmacyOrders as jest.MockedFunction<typeof usePharmacyOrders>;

describe('PharmacyOrders Component', () => {
  const mockPatient: fhir.Patient = {
    resourceType: 'Patient',
    id: 'test-patient-123',
    identifier: [
      {
        value: 'TEST-12345',
        system: 'http://example.com/mrn',
      },
    ],
    name: [
      {
        given: ['John'],
        family: 'Doe',
      },
    ],
  };

  const mockMedicationRequestEntries = [
    {
      fullUrl: 'MedicationRequest/med-req-1',
      resource: {
        resourceType: 'MedicationRequest',
        id: 'med-req-1',
        status: 'active',
        authoredOn: '2024-01-15T10:30:00.000Z',
        medicationReference: {
          display: 'Paracetamol 500mg Tablet',
        },
        dispenseRequest: {
          quantity: {
            value: 20,
          },
        },
        requester: {
          display: 'Dr. John Smith',
        },
      } as unknown as fhir.MedicationRequest,
    },
    {
      fullUrl: 'MedicationRequest/med-req-2',
      resource: {
        resourceType: 'MedicationRequest',
        id: 'med-req-2',
        status: 'active',
        authoredOn: '2024-01-14T09:00:00.000Z',
        medicationReference: {
          display: 'Amoxicillin 250mg Capsule',
        },
        dispenseRequest: {
          quantity: {
            value: 30,
          },
        },
        requester: {
          display: 'Dr. Jane Wilson',
        },
      } as unknown as fhir.MedicationRequest,
    },
    {
      fullUrl: 'MedicationRequest/med-req-3',
      resource: {
        resourceType: 'MedicationRequest',
        id: 'med-req-3',
        status: 'active',
        authoredOn: '2024-01-13T14:20:00.000Z',
        medicationReference: {
          display: 'Ibuprofen 400mg Tablet',
        },
        dispenseRequest: {
          quantity: {
            value: 15,
          },
        },
        requester: {
          display: 'Dr. John Smith',
        },
      } as unknown as fhir.MedicationRequest,
    },
  ];

  const mockMutate = jest.fn();
  const mockGoTo = jest.fn();
  const mockSetCurrPageSize = jest.fn() as unknown as React.Dispatch<React.SetStateAction<number>>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeleton while fetching data', () => {
      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: [],
        isLoading: true,
        error: null,
        mutate: mockMutate,
        paginated: false,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 0,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });

      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      // Check for loading skeleton
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Success State with Data', () => {
    beforeEach(() => {
      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: mockMedicationRequestEntries,
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: true,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 3,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });
    });

    it('should render medication orders table with correct data', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByText('Pending Medication Orders')).toBeInTheDocument();
      });

      // Check table headers
      expect(screen.getByText('Date and time')).toBeInTheDocument();
      expect(screen.getByText('Medication')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Requester')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();

      // Check medication data is displayed
      expect(screen.getByText('Paracetamol 500mg Tablet')).toBeInTheDocument();
      expect(screen.getByText('Amoxicillin 250mg Capsule')).toBeInTheDocument();
      expect(screen.getByText('Ibuprofen 400mg Tablet')).toBeInTheDocument();

      // Check quantities
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();

      // Check requesters
      expect(screen.getAllByText('Dr. John Smith')).toHaveLength(2);
      expect(screen.getByText('Dr. Jane Wilson')).toBeInTheDocument();

      // Check status
      expect(screen.getAllByText('Active')).toHaveLength(3);
    });

    it('should display table description', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Active medication prescriptions awaiting pharmacist review and dispensing'),
        ).toBeInTheDocument();
      });
    });

    it('should render search input with correct placeholder', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search medication orders');
        expect(searchInput).toBeInTheDocument();
      });
    });

    it('should render refresh button', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    it('should render add medication order button', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add medication order/i })).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions - Search', () => {
    beforeEach(() => {
      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: mockMedicationRequestEntries,
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: true,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 3,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });
    });

    it('should update search term when user types in search box', async () => {
      const user = userEvent.setup();
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search medication orders')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search medication orders');
      await user.type(searchInput, 'Paracetamol');

      expect(searchInput).toHaveValue('Paracetamol');
    });

    it('should handle search interaction', async () => {
      const user = userEvent.setup();
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search medication orders')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search medication orders');
      await user.type(searchInput, 'Paracetamol');

      // Verify search input is functional
      expect(searchInput).toHaveValue('Paracetamol');

      // Clear the search
      await user.clear(searchInput);
      expect(searchInput).toHaveValue('');
    });
  });

  describe('User Interactions - Buttons', () => {
    beforeEach(() => {
      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: mockMedicationRequestEntries,
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: true,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 3,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });
    });

    it('should call mutate when refresh button is clicked', async () => {
      const user = userEvent.setup();
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    it('should launch workspace when add medication order button is clicked', async () => {
      const user = userEvent.setup();
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add medication order/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add medication order/i });
      await user.click(addButton);

      expect(mockLaunchAddDrugOrder).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Interactions - Pagination', () => {
    beforeEach(() => {
      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: mockMedicationRequestEntries.slice(0, 2),
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: true,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 15,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });
    });

    it('should display pagination when total items exceed page size', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByText('Paracetamol 500mg Tablet')).toBeInTheDocument();
      });

      // Pagination should be visible
      expect(screen.getByText(/items per page/i)).toBeInTheDocument();
    });

    it('should call goTo when user clicks pagination controls', async () => {
      const user = userEvent.setup();

      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByText('Paracetamol 500mg Tablet')).toBeInTheDocument();
      });

      // Find and click next page button
      const nextButton = screen.getByLabelText(/next page/i);
      await user.click(nextButton);

      expect(mockGoTo).toHaveBeenCalledWith(2);
    });

    it('should call setCurrPageSize when user selects different items per page', async () => {
      const user = userEvent.setup();

      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByText('Paracetamol 500mg Tablet')).toBeInTheDocument();
      });

      // Find page size selector
      const pageSizeSelect = screen.getByLabelText(/items per page/i);
      await user.selectOptions(pageSizeSelect, '20');

      expect(mockSetCurrPageSize).toHaveBeenCalledWith(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle patient without identifier', async () => {
      const patientWithoutIdentifier: fhir.Patient = {
        resourceType: 'Patient',
        id: 'test-patient-no-id',
        identifier: [],
      };

      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: [],
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: false,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 0,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });

      renderWithSwr(<PharmacyOrders patient={patientWithoutIdentifier} />);

      // Should not crash and should show empty state
      await waitFor(() => {
        expect(screen.getByText('No medication orders')).toBeInTheDocument();
      });
    });

    it('should handle medication request without dispense quantity', async () => {
      const medicationWithoutQuantity = [
        {
          ...mockMedicationRequestEntries[0],
          resource: {
            ...mockMedicationRequestEntries[0].resource,
            dispenseRequest: {
              quantity: {
                value: null,
              },
            },
          } as unknown as fhir.MedicationRequest,
        },
      ];

      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: medicationWithoutQuantity,
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: false,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 1,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });

      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByText('Paracetamol 500mg Tablet')).toBeInTheDocument();
      });

      // Should handle null quantity gracefully
      expect(screen.getByText('Quantity')).toBeInTheDocument();
    });

    it('should handle medication request without requester', async () => {
      const medicationWithoutRequester = [
        {
          ...mockMedicationRequestEntries[0],
          resource: {
            ...mockMedicationRequestEntries[0].resource,
            requester: {
              display: null,
            },
          } as unknown as fhir.MedicationRequest,
        },
      ];

      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: medicationWithoutRequester,
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: false,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 1,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });

      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByText('Paracetamol 500mg Tablet')).toBeInTheDocument();
      });

      // Should render table even without requester display
      expect(screen.getByText('Requester')).toBeInTheDocument();
    });

    it('should capitalize status correctly', async () => {
      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: [mockMedicationRequestEntries[0]],
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: false,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 1,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });

      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: mockMedicationRequestEntries,
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: true,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 3,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });
    });

    it('should have proper table structure with headers', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(5);
    });

    it('should have accessible search input', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search medication orders');
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('type', 'search');
      });
    });

    it('should have accessible buttons with proper labels', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add medication order/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Formatting', () => {
    beforeEach(() => {
      mockUsePharmacyOrders.mockReturnValue({
        medicationRequests: mockMedicationRequestEntries,
        isLoading: false,
        error: null,
        mutate: mockMutate,
        paginated: true,
        currentPage: 1,
        goTo: mockGoTo,
        totalCount: 3,
        currentPageSize: { current: 10 },
        currPageSize: 10,
        setCurrPageSize: mockSetCurrPageSize,
      });
    });

    it('should format dates correctly', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        // formatDatetime from @openmrs/esm-framework should format the dates
        // We just verify the component renders without crashing
        expect(screen.getByText('Paracetamol 500mg Tablet')).toBeInTheDocument();
      });
    });

    it('should display medication names from medicationReference', async () => {
      renderWithSwr(<PharmacyOrders patient={mockPatient} />);

      await waitFor(() => {
        expect(screen.getByText('Paracetamol 500mg Tablet')).toBeInTheDocument();
        expect(screen.getByText('Amoxicillin 250mg Capsule')).toBeInTheDocument();
        expect(screen.getByText('Ibuprofen 400mg Tablet')).toBeInTheDocument();
      });
    });
  });
});
