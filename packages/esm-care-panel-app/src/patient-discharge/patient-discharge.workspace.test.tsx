import React from 'react';
import { render, screen } from '@testing-library/react';
import { PatientDischargeWorkspace } from './patient-discharge.workspace';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { usePatient, useEmrConfiguration } from '@openmrs/esm-framework';
import { usePatientDischarge } from './patient-discharge.resource';

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  useVisitOrOfflineVisit: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  usePatient: jest.fn(),
  useEmrConfiguration: jest.fn(),
  ExtensionSlot: jest.fn().mockImplementation(({ name }) => <div data-testid={name} />),
}));

jest.mock('./patient-discharge.resource', () => ({
  usePatientDischarge: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('PatientDischargeWorkspace', () => {
  const mockProps = {
    patientUuid: 'test-patient-uuid',
    wardPatient: {
      patient: {
        uuid: 'test-patient-uuid',
        display: 'Test Patient',
        identifiers: [],
        person: {
          uuid: 'test-person-uuid',
          display: 'Test Person',
          gender: 'M',
          birthdate: '1990-01-01',
          dead: false,
          age: 33,
          deathDate: null,
          causeOfDeath: null,
          preferredAddress: null,
          attributes: [],
        },
      },
      visit: {
        uuid: 'test-visit-uuid',
        display: 'Test Visit',
        encounters: [],
        visitType: { uuid: 'test-visit-type-uuid', display: 'Test Visit Type' },
        startDatetime: '2024-01-01',
        stopDatetime: null,
      },
      bed: {
        uuid: 'test-bed-uuid',
        id: 1,
        bedNumber: 'BED-001',
        bedType: { uuid: 'test-bed-type-uuid', display: 'Standard' },
        status: { uuid: 'test-status-uuid', display: 'OCCUPIED' },
        location: { uuid: 'test-location-uuid', display: 'Test Location' },
        row: 1,
        column: 1,
      },
    },
    closeWorkspace: jest.fn(),
    closeWorkspaceWithSavedChanges: jest.fn(),
    promptBeforeClosing: jest.fn(),
    setTitle: jest.fn(),
  };

  const mockPatient = {
    uuid: 'test-patient-uuid',
    display: 'Test Patient',
  };

  const mockVisit = {
    uuid: 'test-visit-uuid',
    visitType: { uuid: 'test-visit-type-uuid' },
    encounters: [{ uuid: 'test-encounter-uuid' }],
  };

  const mockEmrConfiguration = {
    visitTypes: [],
    visitTypeConfig: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useVisitOrOfflineVisit as jest.Mock).mockReturnValue({
      isLoading: false,
      currentVisit: mockVisit,
      error: null,
    });
    (usePatient as jest.Mock).mockReturnValue({
      patient: mockPatient,
      isLoading: false,
      error: null,
    });
    (useEmrConfiguration as jest.Mock).mockReturnValue({
      emrConfiguration: mockEmrConfiguration,
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });
    (usePatientDischarge as jest.Mock).mockReturnValue({
      handleDischarge: jest.fn(),
    });
  });

  test('renders loading state when data is being fetched', () => {
    (useVisitOrOfflineVisit as jest.Mock).mockReturnValue({
      isLoading: true,
      currentVisit: null,
      error: null,
    });

    render(<PatientDischargeWorkspace {...mockProps} />);
    const loadingSpinner = screen.getAllByText(/loading/i);
    expect(loadingSpinner).toHaveLength(2);
  });

  test('renders error state when there is an error', () => {
    (useVisitOrOfflineVisit as jest.Mock).mockReturnValue({
      isLoading: false,
      currentVisit: null,
      error: new Error('Test error'),
    });

    render(<PatientDischargeWorkspace {...mockProps} />);
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText(/errorLoadingPatientWorkspace/)).toBeInTheDocument();
  });

  test('renders the component with all required slots when data is loaded', () => {
    render(<PatientDischargeWorkspace {...mockProps} />);

    expect(screen.getByTestId('visit-context-header-slot')).toBeInTheDocument();
    expect(screen.getByTestId('form-widget-slot')).toBeInTheDocument();
  });

  test('passes correct state to form-widget-slot', () => {
    render(<PatientDischargeWorkspace {...mockProps} />);

    const formWidgetSlot = screen.getByTestId('form-widget-slot');
    expect(formWidgetSlot).toBeInTheDocument();
  });

  test('handles missing visit data gracefully', () => {
    (useVisitOrOfflineVisit as jest.Mock).mockReturnValue({
      isLoading: false,
      currentVisit: null,
      error: null,
    });

    render(<PatientDischargeWorkspace {...mockProps} />);
    expect(screen.getByTestId('visit-context-header-slot')).toBeInTheDocument();
  });
});
