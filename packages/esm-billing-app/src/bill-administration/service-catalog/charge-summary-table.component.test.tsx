import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { useLayoutType, usePagination, showModal, launchWorkspace, LayoutType } from '@openmrs/esm-framework';
import ChargeSummaryTable from './charge-summary-table.component';
import { useChargeSummaries, type ChargeAble } from './charge-summary.resource';
import { downloadExcelTemplateFile } from './form-helper';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    useLayoutType: jest.fn(),
    usePagination: jest.fn(),
    showModal: jest.fn(),
    launchWorkspace: jest.fn(),
  };
});
jest.mock('./charge-summary.resource', () => ({
  useChargeSummaries: jest.fn(),
}));

jest.mock('./form-helper', () => ({
  downloadExcelTemplateFile: jest.fn(),
  searchTableData: jest.fn((data, searchString) => data),
}));

const mockChargeSummaryItems: ChargeAble[] = [
  {
    uuid: '1',
    name: 'Test Service',
    shortName: 'TS',
    serviceStatus: 'ENABLED',
    serviceType: { uuid: 'type-1', display: 'Laboratory' },
    servicePrices: [
      { uuid: 'price-1', name: 'Cash', price: 100 },
      { uuid: 'price-2', name: 'Insurance', price: 150 },
    ],
    concept: { uuid: 'concept-1', display: 'Test Concept' },
    stockItem: '',
  },
  {
    uuid: '2',
    name: 'Test Commodity',
    shortName: 'TC',
    serviceStatus: 'DISABLED',
    serviceType: { uuid: 'type-2', display: 'Stock Item' },
    servicePrices: [{ uuid: 'price-3', name: 'Cash', price: 200 }],
    concept: { uuid: 'concept-2', display: 'Test Concept 2' },
    stockItem: 'stock-1',
  },
];

describe('ChargeSummaryTable', () => {
  const mockUseLayoutType = useLayoutType as jest.MockedFunction<typeof useLayoutType>;
  const mockUsePagination = usePagination as jest.MockedFunction<typeof usePagination>;
  const mockShowModal = showModal as jest.MockedFunction<typeof showModal>;
  const mockLaunchWorkspace = launchWorkspace as jest.MockedFunction<typeof launchWorkspace>;
  const mockUseChargeSummaries = useChargeSummaries as jest.MockedFunction<typeof useChargeSummaries>;

  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('desktop' as LayoutType);
    mockUsePagination.mockReturnValue({
      results: mockChargeSummaryItems,
      currentPage: 1,
      totalPages: 1,
      paginated: true,
      showNextButton: false,
      showPreviousButton: false,
      goTo: jest.fn(),
      goToNext: jest.fn(),
      goToPrevious: jest.fn(),
    });
    mockUseChargeSummaries.mockReturnValue({
      chargeSummaryItems: mockChargeSummaryItems,
      isLoading: false,
      isValidating: false,
      error: null,
      mutate: jest.fn(),
    });
  });

  test('renders loading state', () => {
    mockUseChargeSummaries.mockReturnValue({
      chargeSummaryItems: [],
      isLoading: true,
      isValidating: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<ChargeSummaryTable />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('renders error state', () => {
    mockUseChargeSummaries.mockReturnValue({
      chargeSummaryItems: [],
      isLoading: false,
      isValidating: false,
      error: new Error('Test error'),
      mutate: jest.fn(),
    });

    render(<ChargeSummaryTable />);
    expect(screen.getByText('Error State')).toBeInTheDocument();
  });

  test('renders empty state', async () => {
    const user = userEvent.setup();
    mockUseChargeSummaries.mockReturnValue({
      chargeSummaryItems: [],
      isLoading: false,
      isValidating: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<ChargeSummaryTable />);
    expect(screen.getByText('There are no {{displayText}} to display for this patient')).toBeInTheDocument();
    const launchFormButton = screen.getByRole('button', { name: /Record/i });
    expect(launchFormButton).toBeInTheDocument();
    await user.click(launchFormButton);
    expect(mockLaunchWorkspace).toHaveBeenCalledWith('billable-service-form');
  });

  test('renders table with data', () => {
    render(<ChargeSummaryTable />);

    // Check if table headers are present
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Short Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Prices')).toBeInTheDocument();

    // Check if data is rendered
    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('TS')).toBeInTheDocument();
    expect(screen.getByText('Laboratory')).toBeInTheDocument();
    expect(screen.getByText('ENABLED')).toBeInTheDocument();
  });

  test('handles search functionality', async () => {
    const user = userEvent.setup();
    render(<ChargeSummaryTable />);

    const searchInput = screen.getByPlaceholderText('Search for charge item');
    await user.type(searchInput, 'Test');

    expect(searchInput).toHaveValue('Test');
  });

  test('handles edit service action', async () => {
    const user = userEvent.setup();
    render(<ChargeSummaryTable />);

    const overflowMenu = screen.getAllByRole('img', { name: 'Options' })[0];
    await user.click(overflowMenu);

    const editButton = screen.getByText('Edit charge item');
    await user.click(editButton);

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('billable-service-form', {
      initialValues: mockChargeSummaryItems[0],
      workspaceTitle: 'Edit Service Charge Item',
    });
  });

  test('handles edit commodity action', async () => {
    const user = userEvent.setup();
    render(<ChargeSummaryTable />);

    const overflowMenu = screen.getAllByRole('img', { name: 'Options' })[0];
    await user.click(overflowMenu);

    const editButton = screen.getByText('Edit charge item');
    await user.click(editButton);

    expect(mockLaunchWorkspace).toHaveBeenCalled();
  });

  test('handles delete action', async () => {
    const user = userEvent.setup();
    render(<ChargeSummaryTable />);

    const overflowMenu = screen.getAllByRole('img', { name: 'Options' })[0];
    await user.click(overflowMenu);

    const deleteButton = screen.getByText('Delete charge item');
    await user.click(deleteButton);

    expect(mockShowModal).toHaveBeenCalledWith('delete-billableservice-modal', {
      closeModal: expect.any(Function),
      chargeableItem: mockChargeSummaryItems[0],
    });
  });
});
