import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PatientComplaintsComponent from './patient-complaints.component';
import { usePaginatedEncounters, useForm, extractComplaintsFromObservations } from './complaints.resource';
import { useConfig, isDesktop } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';

// Mock the dependencies
jest.mock('./complaints.resource', () => ({
  usePaginatedEncounters: jest.fn(),
  useForm: jest.fn(),
  extractComplaintsFromObservations: jest.fn(),
}));
jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(),
  isDesktop: jest.fn(),
  ErrorState: ({ headerTitle }) => <div data-testid="error-state">{headerTitle}</div>,
}));
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  CardHeader: ({ title, children }) => (
    <div>
      {title}
      {children}
    </div>
  ),
  EmptyState: ({ displayText }) => <div data-testid="empty-state">{displayText}</div>,
  usePaginationInfo: jest.fn(),
}));

const mockUsePaginatedEncounters = usePaginatedEncounters as jest.Mock;
const mockUseForm = useForm as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;
const mockIsDesktop = isDesktop as unknown as jest.Mock;
const mockUsePaginationInfo = usePaginationInfo as jest.Mock;
const mockExtractComplaintsFromObservations = extractComplaintsFromObservations as jest.Mock;

const mockConfig = {
  encounterTypes: {
    triage: 'd1059fb9-a079-4feb-a749-eedd709ae542',
  },
  formsList: {
    complaintsFormUuid: '37f6bd8d-586a-4169-95fa-5781f987fe62',
  },
  complaints: {
    chiefComplaintConceptUuid: '160531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    complaintMemberConceptUuid: '5219AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    durationConceptUuid: '159368AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    onsetConceptUuid: 'd7a3441d-6aeb-49be-b7d6-b2a3bb39e78d',
  },
};

const mockEncounterData = [
  {
    uuid: 'encounter-1',
    encounterDatetime: '2023-10-01T10:30:00',
    obs: [
      {
        uuid: 'obs-1',
        concept: {
          uuid: '160531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
        obsDatetime: '2023-10-01T10:30:00',
        groupMembers: [
          {
            uuid: 'obs-1-1',
            concept: {
              uuid: '5219AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
            value: {
              display: 'Headache',
            },
            display: 'Chief Complaint: Headache',
          },
          {
            uuid: 'obs-1-2',
            concept: {
              uuid: '159368AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
            value: '2 days',
          },
          {
            uuid: 'obs-1-3',
            concept: {
              uuid: 'd7a3441d-6aeb-49be-b7d6-b2a3bb39e78d',
            },
            value: {
              uuid: 'onset-uuid-1',
            },
          },
        ],
      },
    ],
  },
  {
    uuid: 'encounter-2',
    encounterDatetime: '2023-09-25T14:15:00',
    obs: [
      {
        uuid: 'obs-2',
        concept: {
          uuid: '160531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
        obsDatetime: '2023-09-25T14:15:00',
        groupMembers: [
          {
            uuid: 'obs-2-1',
            concept: {
              uuid: '5219AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
            value: {
              display: 'Fever',
            },
            display: 'Chief Complaint: Fever',
          },
          {
            uuid: 'obs-2-2',
            concept: {
              uuid: '159368AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
            value: '5 days',
          },
          {
            uuid: 'obs-2-3',
            concept: {
              uuid: 'd7a3441d-6aeb-49be-b7d6-b2a3bb39e78d',
            },
            value: {
              uuid: 'onset-uuid-2',
            },
          },
        ],
      },
    ],
  },
];

const mockConceptLabelMap = {
  'onset-uuid-1': 'Sudden',
  'onset-uuid-2': 'Gradual',
};

const mockComplaints = [
  {
    id: 'obs-1',
    complaint: 'Headache',
    duration: '2 days',
    onset: '01-Oct-2023 - Sudden',
  },
  {
    id: 'obs-2',
    complaint: 'Fever',
    duration: '5 days',
    onset: '25-Sep-2023 - Gradual',
  },
];

describe('PatientComplaintsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue(mockConfig);
    mockIsDesktop.mockReturnValue(true);
    mockUsePaginationInfo.mockReturnValue({
      pageSizes: [5, 10, 15, 20],
    });
    // Default mock for extractComplaintsFromObservations
    mockExtractComplaintsFromObservations.mockReturnValue([]);
  });

  it('should render loading skeleton when data is loading', () => {
    mockUsePaginatedEncounters.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: {},
      isLoading: true,
      error: null,
    });

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveClass('cds--skeleton');
  });

  it('should render error state when encounters fail to load', () => {
    const mockError = new Error('Failed to load encounters');
    mockUsePaginatedEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: mockError,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: {},
      isLoading: false,
      error: null,
    });

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Complaints')).toBeInTheDocument();
  });

  it('should render error state when form fails to load', () => {
    const mockError = new Error('Failed to load form');
    mockUsePaginatedEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: {},
      isLoading: false,
      error: mockError,
    });

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Complaints')).toBeInTheDocument();
  });

  it('should render empty state when there are no complaints', () => {
    mockUsePaginatedEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: {},
      isLoading: false,
      error: null,
    });

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('Complaints')).toBeInTheDocument();
  });

  it('should render complaints table with data', () => {
    mockUsePaginatedEncounters.mockReturnValue({
      data: mockEncounterData,
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: mockConceptLabelMap,
      isLoading: false,
      error: null,
    });
    mockExtractComplaintsFromObservations.mockReturnValue(mockComplaints);

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    // Check table headers
    expect(screen.getByText('Complaint')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Onset')).toBeInTheDocument();

    // Check table data
    expect(screen.getByText('Headache')).toBeInTheDocument();
    expect(screen.getByText('2 days')).toBeInTheDocument();
    expect(screen.getByText('Fever')).toBeInTheDocument();
    expect(screen.getByText('5 days')).toBeInTheDocument();
  });

  it('should handle pagination correctly', async () => {
    const user = userEvent.setup();
    const mockGoTo = jest.fn();

    // Create enough complaints data to enable pagination (more than 5 items for page size 5)
    const paginationComplaints = [
      { id: 'obs-1', complaint: 'Headache', duration: '2 days', onset: '01-Oct-2023 - Sudden' },
      { id: 'obs-2', complaint: 'Fever', duration: '5 days', onset: '25-Sep-2023 - Gradual' },
      { id: 'obs-3', complaint: 'Cough', duration: '3 days', onset: '28-Sep-2023 - Sudden' },
      { id: 'obs-4', complaint: 'Fatigue', duration: '7 days', onset: '20-Sep-2023 - Gradual' },
      { id: 'obs-5', complaint: 'Nausea', duration: '1 day', onset: '30-Sep-2023 - Sudden' },
      { id: 'obs-6', complaint: 'Dizziness', duration: '4 days', onset: '24-Sep-2023 - Gradual' },
    ];

    mockUsePaginatedEncounters.mockReturnValue({
      data: mockEncounterData,
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: mockGoTo,
      totalPages: 2,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: mockConceptLabelMap,
      isLoading: false,
      error: null,
    });
    mockExtractComplaintsFromObservations.mockReturnValue(paginationComplaints);

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    // Find and click the next page button
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextPageButton);

    // Verify goTo was called with page 2
    await waitFor(() => {
      expect(mockGoTo).toHaveBeenCalledWith(2);
    });
  });

  it('should display "sm" size table on desktop layout', () => {
    mockIsDesktop.mockReturnValue(true);
    mockUsePaginatedEncounters.mockReturnValue({
      data: mockEncounterData,
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: mockConceptLabelMap,
      isLoading: false,
      error: null,
    });
    mockExtractComplaintsFromObservations.mockReturnValue(mockComplaints);

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('cds--data-table--sm');
  });

  it('should display "lg" size table on tablet layout', () => {
    mockIsDesktop.mockReturnValue(false);
    mockUsePaginatedEncounters.mockReturnValue({
      data: mockEncounterData,
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: mockConceptLabelMap,
      isLoading: false,
      error: null,
    });
    mockExtractComplaintsFromObservations.mockReturnValue(mockComplaints);

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('cds--data-table--lg');
  });

  it('should display placeholder when complaint data is missing', () => {
    const encounterWithMissingData = [
      {
        uuid: 'encounter-3',
        encounterDatetime: '2023-10-01T10:30:00',
        obs: [
          {
            uuid: 'obs-3',
            concept: {
              uuid: '160531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            },
            obsDatetime: '2023-10-01T10:30:00',
            groupMembers: [],
          },
        ],
      },
    ];

    const mockComplaintsWithPlaceholders = [
      {
        id: 'obs-3',
        complaint: '--',
        duration: '--',
        onset: '--',
      },
    ];

    mockUsePaginatedEncounters.mockReturnValue({
      data: encounterWithMissingData,
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: {},
      isLoading: false,
      error: null,
    });
    mockExtractComplaintsFromObservations.mockReturnValue(mockComplaintsWithPlaceholders);

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    // Should display placeholder "--" for missing data
    const placeholders = screen.getAllByText('--');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('should have zebra striped rows', () => {
    mockUsePaginatedEncounters.mockReturnValue({
      data: mockEncounterData,
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: mockConceptLabelMap,
      isLoading: false,
      error: null,
    });
    mockExtractComplaintsFromObservations.mockReturnValue(mockComplaints);

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('cds--data-table--zebra');
  });

  it('should call usePaginatedEncounters with correct parameters', () => {
    mockUsePaginatedEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: {},
      isLoading: false,
      error: null,
    });

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    expect(mockUsePaginatedEncounters).toHaveBeenCalledWith(
      'test-patient-uuid',
      'd1059fb9-a079-4feb-a749-eedd709ae542',
      5,
    );
  });

  it('should call useForm with correct form UUID', () => {
    mockUsePaginatedEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 1,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: {},
      isLoading: false,
      error: null,
    });

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    expect(mockUseForm).toHaveBeenCalledWith('37f6bd8d-586a-4169-95fa-5781f987fe62');
  });

  it('should have pagination controls with correct props', () => {
    mockUsePaginatedEncounters.mockReturnValue({
      data: mockEncounterData,
      isLoading: false,
      error: null,
      currentPage: 1,
      goTo: jest.fn(),
      totalPages: 2,
    });
    mockUseForm.mockReturnValue({
      conceptLabelMap: mockConceptLabelMap,
      isLoading: false,
      error: null,
    });
    mockExtractComplaintsFromObservations.mockReturnValue(mockComplaints);

    render(<PatientComplaintsComponent patientUuid="test-patient-uuid" />);

    // Pagination should be present
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });
});
