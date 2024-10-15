import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { EncounterList } from './encounter-list.component';
import {
  formConceptMap,
  mockDescription,
  mockEncounterData,
  mockEncounterType,
  mockFormList,
  mockHeaderTitle,
  mockLaunchOptions,
  mockTableHeaders,
} from '../../../../../__mocks__/encounter-observation.mock';
import { waitForLoadingToFinish } from '../../../../../tools/test-helpers';
import { openmrsFetch, usePagination } from '@openmrs/esm-framework';

const testProps = {
  tableHeaders: mockTableHeaders,
  formConceptMap: formConceptMap,
  patientUuid: 'some-uuid',
  encounterType: mockEncounterType,
  columns: mockTableHeaders,
  headerTitle: mockHeaderTitle,
  description: mockDescription,
  formList: mockFormList,
  filter: jest.fn(),
  launchOptions: mockLaunchOptions,
  isExpandable: true,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

describe('EncounterList', () => {
  afterEach(() => jest.clearAllMocks());

  test('should render loading datatable skeleton', async () => {
    // Mock SWRImmutable hook to return error state
    mockOpenmrsFetch.mockReturnValueOnce({
      encounters: [],
      error: null,
      isLoading: true,
    });

    render(<EncounterList {...testProps} />);
    const loadingSkeleton = screen.getByRole('table');
    expect(loadingSkeleton).toBeInTheDocument();
    expect(loadingSkeleton).toHaveClass('cds--skeleton cds--data-table');
  });

  test('should render the table component', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockEncounterData.data.results });
    mockUsePagination.mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockEncounterData.data.results,
    }));
    const user = userEvent.setup();

    render(<EncounterList {...testProps} />);

    expect(screen.getByText('Test Date')).toBeInTheDocument();
    expect(screen.getByText('Test type')).toBeInTheDocument();

    const expectedColumnHeaders = [/Test Date/, /Test type/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const tableRowGroup = screen.getAllByRole('rowgroup');
    expect(tableRowGroup).toHaveLength(2);

    // clicking the row should expand the row
    const expandCurrentRowButton = screen.getByRole('button', { name: /Expand current row/ });
    expect(expandCurrentRowButton).toBeInTheDocument();
    await user.click(expandCurrentRowButton);
  });

  xit('renders an error state if there was a problem fetching encounters data', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({
      isLoading: false,
      error: new Error('some error'),
      encounters: [],
      mutate: jest.fn(),
    });

    render(<EncounterList {...testProps} />);
    const errorState = screen.getByText(/Sorry, there was a problem displaying this information./);
    expect(errorState).toBeInTheDocument();
  });

  test('renders an empty state if there is no data available', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ isLoading: false, error: null, encounters: [], onFormSave: jest.fn() });
    mockUsePagination.mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    }));

    render(<EncounterList {...testProps} />);

    expect(screen.getByText(/There are no .* to display for this patient/i)).toBeInTheDocument();
  });
});
