import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useBills } from '../billing.resource';
import BillsTable from './bills-table.component';

const mockbills = useBills as jest.Mock;

const mockBillsData = [
  { id: '1', patientName: 'John Doe', identifier: '12345678', visitType: 'Checkup', patientUuid: 'uuid1' },
];

jest.mock('../billing.resource', () => ({
  ...jest.requireActual('../billing.resource'),
  useBills: jest.fn(() => ({
    bills: mockBillsData,
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
  useConfig: jest.fn(() => ({ bills: { pageSizes: [10, 20, 30, 40, 50], pageSize: 10 } })),
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
    const expectedColumnHeaders = [/Visit time/, /Identifier/, /Name/, /Billing service/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const patientNameLink = screen.getByText('John Doe');
    expect(patientNameLink).toBeInTheDocument();
    expect(patientNameLink.tagName).toBe('A');
  });

  it.skip('filters active visits based on search input', () => {
    mockbills.mockImplementationOnce(() => ({
      activeVisits: [
        {
          id: '1',
          patientName: 'John Doe',
          visitTime: '12:59',
          billingService: '',
          department: 'uuid1',
        },
        {
          id: '2',
          patientName: 'Some One',
          visitTime: '12:12',
          billingService: '',
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
    mockbills.mockImplementationOnce(() => ({
      bills: [],
      isLoading: false,
      isValidating: false,
      error: null,
    }));

    render(<BillsTable />);

    expect(screen.getByText(/there are no bills to display/i)).toBeInTheDocument();
  });

  it('should not display the table when the data is loading', () => {
    mockbills.mockImplementationOnce(() => ({
      bills: undefined,
      isLoading: true,
      isValidating: false,
      error: null,
    }));

    render(<BillsTable />);

    const expectedColumnHeaders = [/Visit time/, /Identifier/, /Name/, /Billing service/, /Department/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.queryByRole('columnheader', { name: new RegExp(header, 'i') })).not.toBeInTheDocument();
    });
  });

  it('should display the error state when there is error', () => {
    mockbills.mockImplementationOnce(() => ({
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
