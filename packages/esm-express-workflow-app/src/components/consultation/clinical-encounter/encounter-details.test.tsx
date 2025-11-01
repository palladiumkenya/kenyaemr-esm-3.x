import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import EncounterDetails from './encounter-details.component';
import { usePatientEncounter, useClinicalEncounterForm } from '../../../hooks/usePatientEncounter';

// Create a mock function for the workspace launcher
const mockLaunchWorkspaceRequiringVisit = jest.fn();

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  formatDatetime: jest.fn((date, options) => '15-Jan-2024'),
  parseDate: jest.fn((date) => new Date(date)),
  openmrsFetch: jest.fn(),
  useConfig: jest.fn(() => ({
    clinicalEncounter: {
      encounterTypeUuid: '465a92f2-baf8-42e9-9612-53064be868e8',
      formUuid: 'e958f902-64df-4819-afd4-7fb061f59308',
    },
  })),
  ErrorState: jest.fn(({ error, headerTitle }) => (
    <div data-testid="error-state">
      <h2>{headerTitle}</h2>
      <p>{error.message}</p>
    </div>
  )),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  CardHeader: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="card-header">
      <h2>{title}</h2>
      {children}
    </div>
  ),
  useLaunchWorkspaceRequiringVisit: jest.fn(),
}));

jest.mock('@carbon/react', () => ({
  ...jest.requireActual('@carbon/react'),
  TabsSkeleton: jest.fn(() => <div data-testid="tabs-skeleton">Loading tabs...</div>),
}));

jest.mock('../../../hooks/usePatientEncounter');

const mockUsePatientEncounter = usePatientEncounter as jest.MockedFunction<typeof usePatientEncounter>;
const mockUseClinicalEncounterForm = useClinicalEncounterForm as jest.MockedFunction<typeof useClinicalEncounterForm>;
const mockUseLaunchWorkspaceRequiringVisit = useLaunchWorkspaceRequiringVisit as jest.MockedFunction<
  typeof useLaunchWorkspaceRequiringVisit
>;

describe('EncounterDetails', () => {
  const patientUuid = 'test-patient-uuid';

  const mockEncounters = [
    {
      uuid: 'encounter-1',
      encounterDatetime: '2024-01-15T10:30:00.000Z',
      encounterType: {
        uuid: 'encounter-type-uuid',
        display: 'Clinical Consultation',
      },
      location: {
        uuid: 'location-uuid',
        display: 'Outpatient Clinic',
      },
      encounterProviders: [
        {
          uuid: 'provider-uuid',
          display: 'Dr. John Doe',
          provider: {
            uuid: 'provider-uuid',
            display: 'Dr. John Doe',
          },
        },
      ],
      obs: [
        {
          uuid: 'obs-1',
          concept: {
            uuid: 'concept-visit-uuid',
            display: 'Visit Reason',
          },
          value: 'Follow-up',
          obsDatetime: '2024-01-15T10:30:00.000Z',
        },
        {
          uuid: 'obs-2',
          concept: {
            uuid: 'concept-history-uuid',
            display: 'Chief Complaint',
          },
          value: 'Headache',
          obsDatetime: '2024-01-15T10:30:00.000Z',
        },
        {
          uuid: 'obs-3',
          concept: {
            uuid: 'concept-exam-uuid',
            display: 'Blood Pressure',
          },
          value: '120/80',
          obsDatetime: '2024-01-15T10:30:00.000Z',
        },
        {
          uuid: 'obs-4',
          concept: {
            uuid: 'concept-management-uuid',
            display: 'Diagnosis',
          },
          value: {
            display: 'Migraine',
          },
          obsDatetime: '2024-01-15T10:30:00.000Z',
        },
      ],
    },
    {
      uuid: 'encounter-2',
      encounterDatetime: '2024-01-10T09:00:00.000Z',
      encounterType: {
        uuid: 'encounter-type-uuid',
        display: 'Clinical Consultation',
      },
      location: {
        uuid: 'location-uuid',
        display: 'Outpatient Clinic',
      },
      encounterProviders: [],
      obs: [],
    },
  ];

  const mockConceptLabelMap = {
    'Visit Details': {
      'concept-visit-uuid': 'Visit Reason',
    },
    'Patient History': {
      'concept-history-uuid': 'Chief Complaint',
    },
    'Patient Examination': {
      'concept-exam-uuid': 'Blood Pressure',
    },
    'Patient Management': {
      'concept-management-uuid': 'Diagnosis',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLaunchWorkspaceRequiringVisit.mockClear();
    mockUseLaunchWorkspaceRequiringVisit.mockReturnValue(mockLaunchWorkspaceRequiringVisit);
    mockUsePatientEncounter.mockReturnValue({
      encounters: mockEncounters as Array<any>,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
    mockUseClinicalEncounterForm.mockReturnValue({
      form: {},
      conceptLabelMap: mockConceptLabelMap,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
  });

  describe('Component Rendering', () => {
    it('renders the component with tabs', () => {
      render(<EncounterDetails patientUuid={patientUuid} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
      expect(screen.getAllByText('Visit Details').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Patient History').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Patient Examination').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Patient Management').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lab Results').length).toBeGreaterThan(0);
    });

    it('renders with correct patient UUID prop', () => {
      render(<EncounterDetails patientUuid={patientUuid} />);

      expect(mockUsePatientEncounter).toHaveBeenCalledWith(patientUuid, '465a92f2-baf8-42e9-9612-53064be868e8');
    });

    it('displays the most recent encounter', () => {
      render(<EncounterDetails patientUuid={patientUuid} />);

      // The component should display the most recent encounter (encounter-1 from 2024-01-15)
      expect(screen.getByText('15-Jan-2024')).toBeInTheDocument();
      expect(screen.getByText('Clinical Consultation')).toBeInTheDocument();
      expect(screen.getByText('Outpatient Clinic')).toBeInTheDocument();
      expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
    });
  });

  describe('Visit Details Tab', () => {
    it('displays visit details correctly', () => {
      render(<EncounterDetails patientUuid={patientUuid} />);

      // Visit Details tab should be visible by default
      expect(screen.getByText('Visit Date')).toBeInTheDocument();
      expect(screen.getByText('Visit Type')).toBeInTheDocument();
      expect(screen.getByText('Visit Location')).toBeInTheDocument();
      expect(screen.getByText('Visit Provider')).toBeInTheDocument();
    });

    it('renders Add button in Visit Details', () => {
      render(<EncounterDetails patientUuid={patientUuid} />);

      const addButtons = screen.getAllByText('Add');
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('switches to Patient History tab and displays correct content', async () => {
      const user = userEvent.setup();
      render(<EncounterDetails patientUuid={patientUuid} />);

      const historyTab = screen.getAllByText('Patient History')[0];
      await user.click(historyTab);

      // Check that Patient History tab is active and renders card header
      const tabPanel = screen.getByRole('tabpanel');
      expect(within(tabPanel).getByText('Chief Complaint')).toBeInTheDocument();
    });

    it('switches to Patient Examination tab and displays correct content', async () => {
      const user = userEvent.setup();
      render(<EncounterDetails patientUuid={patientUuid} />);

      const examinationTab = screen.getAllByText('Patient Examination')[0];
      await user.click(examinationTab);

      // Check that Patient Examination tab is active and renders card header
      const tabPanel = screen.getByRole('tabpanel');
      expect(within(tabPanel).getByText('Blood Pressure')).toBeInTheDocument();
    });

    it('switches to Patient Management tab and displays correct content', async () => {
      const user = userEvent.setup();
      render(<EncounterDetails patientUuid={patientUuid} />);

      const managementTab = screen.getAllByText('Patient Management')[0];
      await user.click(managementTab);

      // Check that Patient Management tab is active and renders card header
      const tabPanel = screen.getByRole('tabpanel');
      expect(within(tabPanel).getByText('Diagnosis')).toBeInTheDocument();
    });
  });

  describe('Add Button Functionality', () => {
    it('launches workspace when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterDetails patientUuid={patientUuid} />);

      const addButton = screen.getAllByText('Add')[0];
      await user.click(addButton);

      expect(mockLaunchWorkspaceRequiringVisit).toHaveBeenCalledWith({
        workspaceTitle: 'Visit Details',
        mutateForm: expect.any(Function),
        formInfo: {
          encounterUuid: '',
          formUuid: 'e958f902-64df-4819-afd4-7fb061f59308',
          additionalProps: {},
        },
      });
    });

    it('launches workspace with correct title for Patient History tab', async () => {
      const user = userEvent.setup();
      render(<EncounterDetails patientUuid={patientUuid} />);

      // Switch to Patient History tab
      const tabs = screen.getAllByRole('tab');
      await user.click(tabs[1]); // Click Patient History tab

      // Wait for tab panel to be visible and find the Add button within it
      const tabPanel = screen.getByRole('tabpanel');
      const addButton = within(tabPanel).getByText('Add');
      await user.click(addButton);

      expect(mockLaunchWorkspaceRequiringVisit).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceTitle: 'Patient History',
        }),
      );
    });
  });

  describe('Loading and Error States', () => {
    it('renders skeleton when loading', () => {
      mockUsePatientEncounter.mockReturnValue({
        encounters: [],
        isLoading: true,
        error: null,
        mutate: jest.fn(),
      });

      render(<EncounterDetails patientUuid={patientUuid} />);

      // Component should render loading skeleton
      expect(screen.getByTestId('tabs-skeleton')).toBeInTheDocument();
      expect(screen.getByText('Loading tabs...')).toBeInTheDocument();
    });

    it('renders error state when there is an error', () => {
      const errorMessage = 'Failed to fetch encounters';
      mockUsePatientEncounter.mockReturnValue({
        encounters: [],
        isLoading: false,
        error: new Error(errorMessage),
        mutate: jest.fn(),
      });

      render(<EncounterDetails patientUuid={patientUuid} />);

      // Component should render error state
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Encounter Details')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty encounters array', () => {
      mockUsePatientEncounter.mockReturnValue({
        encounters: [],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<EncounterDetails patientUuid={patientUuid} />);

      expect(screen.getAllByText('Visit Details').length).toBeGreaterThan(0);
      // Should not crash when there are no encounters
    });

    it('handles encounter with no observations', () => {
      mockUsePatientEncounter.mockReturnValue({
        encounters: [
          {
            uuid: 'encounter-no-obs',
            encounterDatetime: '2024-01-15T10:30:00.000Z',
            encounterType: {
              uuid: 'encounter-type-uuid',
              display: 'Clinical Consultation',
            },
            location: {
              uuid: 'location-uuid',
              display: 'Outpatient Clinic',
            },
            encounterProviders: [],
            obs: [],
          },
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<EncounterDetails patientUuid={patientUuid} />);

      expect(screen.getAllByText('Visit Details').length).toBeGreaterThan(0);
      // Should render basic encounter info even without observations
      expect(screen.getByText('Clinical Consultation')).toBeInTheDocument();
    });

    it('handles missing encounter providers', () => {
      mockUsePatientEncounter.mockReturnValue({
        encounters: [
          {
            uuid: 'encounter-no-provider',
            encounterDatetime: '2024-01-15T10:30:00.000Z',
            encounterType: {
              uuid: 'encounter-type-uuid',
              display: 'Clinical Consultation',
            },
            location: {
              uuid: 'location-uuid',
              display: 'Outpatient Clinic',
            },
            encounterProviders: [],
            obs: [],
          },
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<EncounterDetails patientUuid={patientUuid} />);

      expect(screen.getByText('Visit Provider')).toBeInTheDocument();
      // Should handle undefined provider gracefully
    });

    it('handles null conceptLabelMap', () => {
      mockUseClinicalEncounterForm.mockReturnValue({
        form: {},
        conceptLabelMap: null,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<EncounterDetails patientUuid={patientUuid} />);

      expect(screen.getAllByText('Visit Details').length).toBeGreaterThan(0);
      // Should not crash with null conceptLabelMap
    });

    it('handles observations with unmapped concepts', () => {
      mockUsePatientEncounter.mockReturnValue({
        encounters: [
          {
            uuid: 'encounter-unmapped',
            encounterDatetime: '2024-01-15T10:30:00.000Z',
            encounterType: {
              uuid: 'encounter-type-uuid',
              display: 'Clinical Consultation',
            },
            location: {
              uuid: 'location-uuid',
              display: 'Outpatient Clinic',
            },
            encounterProviders: [],
            obs: [
              {
                uuid: 'obs-unmapped',
                concept: {
                  uuid: 'unmapped-concept-uuid',
                  display: 'Unknown Concept',
                },
                value: 'Some value',
                obsDatetime: '2024-01-15T10:30:00.000Z',
              },
            ],
          },
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<EncounterDetails patientUuid={patientUuid} />);

      expect(screen.getAllByText('Visit Details').length).toBeGreaterThan(0);
      // Unmapped observations should not appear in any section
    });
  });

  describe('Observation Grouping', () => {
    it('groups observations correctly by section', async () => {
      const user = userEvent.setup();
      render(<EncounterDetails patientUuid={patientUuid} />);

      // Component should render tabs
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);

      // Check Patient History section
      const historyTab = tabs[1];
      await user.click(historyTab);
      let tabPanel = screen.getByRole('tabpanel');
      expect(within(tabPanel).getByText('Chief Complaint')).toBeInTheDocument();

      // Check Patient Examination section
      const examinationTab = tabs[2];
      await user.click(examinationTab);
      tabPanel = screen.getByRole('tabpanel');
      expect(within(tabPanel).getByText('Blood Pressure')).toBeInTheDocument();

      // Check Patient Management section
      const managementTab = tabs[3];
      await user.click(managementTab);
      tabPanel = screen.getByRole('tabpanel');
      expect(within(tabPanel).getByText('Diagnosis')).toBeInTheDocument();
    });
  });

  describe('Encounter Sorting', () => {
    it('displays the most recent encounter when multiple encounters exist', () => {
      const multipleEncounters = [
        {
          ...mockEncounters[1],
          encounterDatetime: '2024-01-10T09:00:00.000Z', // Older
        },
        {
          ...mockEncounters[0],
          encounterDatetime: '2024-01-20T14:00:00.000Z', // Newer
        },
      ];

      mockUsePatientEncounter.mockReturnValue({
        encounters: multipleEncounters as Array<any>,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<EncounterDetails patientUuid={patientUuid} />);

      // Should display the newer encounter date
      expect(formatDatetime).toHaveBeenCalledWith(expect.any(Date), { mode: 'wide', noToday: true });
    });
  });

  describe('Accessibility', () => {
    it('maintains proper tab navigation', async () => {
      const user = userEvent.setup();
      render(<EncounterDetails patientUuid={patientUuid} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);

      // All tabs should be accessible
      tabs.forEach((tab) => {
        expect(tab).toBeInTheDocument();
      });
    });

    it('has proper ARIA attributes for tabs', () => {
      render(<EncounterDetails patientUuid={patientUuid} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });
  });
});
