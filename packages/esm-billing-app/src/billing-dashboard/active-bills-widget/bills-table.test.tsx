import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useConfig, usePagination } from '@openmrs/esm-framework';
import { useActiveBills } from '../../hooks/useActiveBills';
import BillsTable from './bills-table.component';

const mockActiveBills = useActiveBills as jest.Mock;

const mockBillsData = [
  { id: '1', patientName: 'John Doe', identifier: '12345678', visitType: 'Checkup', patientUuid: 'uuid1' },
];

jest.mock('./../../hooks/useActiveBills', () => ({
  ...jest.requireActual('../../hooks/useActiveBills'),
  useActiveBills: jest.fn(() => ({
    activeBills: mockBillsData,
    isLoading: false,
    isValidating: false,
    error: null,
  })),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  ErrorState: jest.fn(() => (
    <div>
      Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site
      administrator and quote the error code above.
    </div>
  )),
  useConfig: jest.fn(() => ({ activeBills: { pageSizes: [10, 20, 30, 40, 50], pageSize: 10 } })),
  usePagination: jest.fn().mockImplementation((data) => ({
    currentPage: 1,
    goTo: () => {},
    results: data,
    paginated: false,
  })),
}));

describe('BillsTable', () => {
  it('renders data table with pending bills', () => {
    render(<BillsTable />);

    expect(screen.getByText('Visit time')).toBeInTheDocument();
    expect(screen.getByText('Identifier')).toBeInTheDocument();
    const expectedColumnHeaders = [
      /Visit time/,
      /Identifier/,
      /Name/,
      /Billing service/,
      /Billing price/,
      /Department/,
    ];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const patientNameLink = screen.getByText('John Doe');
    expect(patientNameLink).toBeInTheDocument();
    expect(patientNameLink.tagName).toBe('A');
  });

  it.skip('filters active visits based on search input', () => {
    mockActiveBills.mockImplementationOnce(() => ({
      activeVisits: [
        {
          id: '1',
          patientName: 'John Doe',
          visitTime: '12:59',
          billingService: '',
          billingPrice: 'Checkup',
          department: 'uuid1',
        },
        {
          id: '2',
          patientName: 'Some One',
          visitTime: '12:12',
          billingService: '',
          billingPrice: 'Checkup',
          department: 'uuid2',
        },
      ],
      isLoading: false,
      isValidating: false,
      error: null,
    }));
    render(<BillsTable />);

    const searchInput = screen.getByPlaceholderText('Filter table');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Some One')).toBeNull();
  });

  it('displays empty state when there are no bills', () => {
    mockActiveBills.mockImplementationOnce(() => ({
      activeBills: [],
      isLoading: false,
      isValidating: false,
      error: null,
    }));

    render(<BillsTable />);

    expect(screen.getByText('There are no bills to display for this location.')).toBeInTheDocument();
  });

  it('should not display the table when the data is loading', () => {
    mockActiveBills.mockImplementationOnce(() => ({
      activeBills: undefined,
      isLoading: true,
      isValidating: false,
      error: null,
    }));

    render(<BillsTable />);

    const expectedColumnHeaders = [
      /Visit time/,
      /Identifier/,
      /Name/,
      /Billing service/,
      /Billing price/,
      /Department/,
    ];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.queryByRole('columnheader', { name: new RegExp(header, 'i') })).not.toBeInTheDocument();
    });
  });

  it('should display the error state when there is error', () => {
    mockActiveBills.mockImplementationOnce(() => ({
      activeVisits: undefined,
      isLoading: false,
      isValidating: false,
      error: 'Error in fetching data',
    }));

    render(<BillsTable />);

    expect(screen.getByText(/sorry, there was a problem displaying this information/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
