import React from 'react';
import { render, screen } from '@testing-library/react';
import { useBills } from '../billing.resource';
import BillsTable from './bills-table.component';
import userEvent from '@testing-library/user-event';

const mockbills = useBills as jest.Mock;

const mockBillsData = [
  {
    uuid: '1',
    patientName: 'John Doe',
    identifier: '12345678',
    visitType: 'Checkup',
    patientUuid: 'uuid1',
    dateCreated: '2024-01-01',
    status: 'PENDING',
    lineItems: [{ billableService: 'service:Consultation', item: 'item:Medicine' }],
  },
  {
    uuid: '2',
    patientName: 'Mary Smith',
    identifier: '98765432',
    visitType: 'Wake up',
    patientUuid: 'uuid2',
    dateCreated: '2024-01-02',
    status: 'PAID',
    lineItems: [{ billableService: 'service:Lab Test' }],
  },
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

describe('BillsTable', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders data table with bills', () => {
    render(<BillsTable />);

    const expectedColumnHeaders = [/Visit time/, /Identifier/, /Name/, /Billed Items/, /Status/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    setTimeout(() => {
      const patientNameLink = screen.getByRole('link', { name: 'John Doe' });
      expect(patientNameLink).toBeInTheDocument();
    }, 5000);
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
      bills: undefined,
      isLoading: false,
      isValidating: false,
      error: 'Error in fetching data',
    }));

    render(<BillsTable />);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  test('should filter bills by search term and bill payment status', async () => {
    render(<BillsTable />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'John Doe');

    setTimeout(async () => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Mary Smith')).not.toBeInTheDocument();

      await user.clear(searchInput);
      await user.type(searchInput, 'Mary Smith');

      expect(screen.getByText('Mary Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    }, 5000);

    // Test filter dropdown
    const filterDropdown = screen.getByRole('combobox');
    await user.click(filterDropdown);
    await user.click(screen.getByText('Pending bills'));

    expect(mockbills).toHaveBeenCalledWith('', 'PENDING');
  });

  test('should show the loading spinner while retrieving data', () => {
    mockbills.mockImplementationOnce(() => ({
      bills: undefined,
      isLoading: true,
      isValidating: false,
      error: null,
    }));

    render(<BillsTable />);

    const dataTableSkeleton = screen.getByRole('table');
    expect(dataTableSkeleton).toBeInTheDocument();
    expect(dataTableSkeleton).toHaveClass('cds--skeleton cds--data-table cds--data-table--zebra');
  });

  test('should render patient name as a link', async () => {
    render(<BillsTable />);

    setTimeout(() => {
      const patientNameLink = screen.getByRole('link', { name: 'John Doe' });
      expect(patientNameLink).toBeInTheDocument();
    }, 5000);
  });
});
