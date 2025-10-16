import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchWorkspace, formatDatetime, useLayoutType, isDesktop } from '@openmrs/esm-framework';

import AdmissionRequest from './admission-request.component';
import { useAdmissionRequest } from './in-patient.resource';
import { type AdmissionRequest as AdmissionRequestType } from '../types';

const mockUseAdmissionRequest = useAdmissionRequest as jest.MockedFunction<typeof useAdmissionRequest>;
const mockLaunchWorkspace = launchWorkspace as jest.MockedFunction<typeof launchWorkspace>;
const mockFormatDatetime = formatDatetime as jest.MockedFunction<typeof formatDatetime>;
const mockUseLayoutType = useLayoutType as jest.MockedFunction<typeof useLayoutType>;
const mockIsDesktop = isDesktop as jest.MockedFunction<typeof isDesktop>;

jest.mock('./in-patient.resource', () => ({
  useAdmissionRequest: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn().mockReturnValue({
    formsList: {
      admissionRequestFormUuid: 'test-admission-form-uuid',
    },
  }),
  formatDatetime: jest.fn().mockReturnValue('2023-10-16 10:30 AM'),
  useLayoutType: jest.fn().mockReturnValue('desktop'),
  isDesktop: jest.fn().mockReturnValue(true),
  launchWorkspace: jest.fn(),
}));

const mockMutate = jest.fn();
const patientUuid = 'test-patient-uuid';

const mockAdmissionRequestData: AdmissionRequestType[] = [
  {
    patient: {
      uuid: 'test-patient-uuid',
      person: {
        uuid: 'test-person-uuid',
        age: 35,
        dead: false,
        display: 'John Doe',
        causeOfDeath: '',
        gender: 'M',
        deathDate: '',
        attributes: [],
      },
      identifiers: [{ uuid: 'test-identifier-uuid' }],
    },
    dispositionLocation: {
      uuid: 'test-location-uuid',
      display: 'Ward A',
    },
    dispositionType: 'ADMIT',
    disposition: {
      uuid: 'test-disposition-uuid',
      display: 'Admit to hospital',
      answers: [],
    },
    dispositionEncounter: {
      uuid: 'test-encounter-uuid',
      encounterDatetime: '2023-10-16T10:30:00.000+0000',
      patient: { uuid: 'test-patient-uuid' },
      location: { uuid: 'test-location-uuid' },
      form: {
        name: 'Admission Form',
        uuid: 'test-form-uuid',
        version: '1.0',
        published: true,
        retired: false,
        resources: [],
        encounterType: {
          uuid: 'test-encounter-type-uuid',
          name: 'Admission',
          viewPrivilege: null,
          editPrivilege: null,
        },
      },
      encounterType: { uuid: 'test-encounter-type-uuid', name: 'Admission', display: 'Admission' },
      obs: [],
      orders: [],
      voided: false,
      auditInfo: {
        creator: { uuid: 'test-creator-uuid', display: 'Admin' },
        dateCreated: '2023-10-16T10:30:00.000+0000',
        changedBy: null,
        dateChanged: null,
      },
      visit: {
        uuid: 'test-visit-uuid',
        startDatetime: '2023-10-16T10:00:00.000+0000',
        encounters: [],
      },
      encounterProviders: [],
      diagnoses: [],
      resourceVersion: '1.9',
    },
    dispositionObsGroup: {
      uuid: 'test-obs-group-uuid',
      concept: { uuid: 'test-concept-uuid' },
      value: null,
      obsDatetime: '2023-10-16T10:30:00.000+0000',
    },
    visit: {
      uuid: 'test-visit-uuid',
      startDatetime: '2023-10-16T10:00:00.000+0000',
      encounters: [],
    },
  },
  {
    patient: {
      uuid: 'test-patient-uuid-2',
      person: {
        uuid: 'test-person-uuid-2',
        age: 42,
        dead: false,
        display: 'Jane Smith',
        causeOfDeath: '',
        gender: 'F',
        deathDate: '',
        attributes: [],
      },
      identifiers: [{ uuid: 'test-identifier-uuid-2' }],
    },
    dispositionLocation: {
      uuid: 'test-location-uuid-2',
      display: 'Ward B',
    },
    dispositionType: 'ADMIT',
    disposition: {
      uuid: 'test-disposition-uuid-2',
      display: 'Admit to ICU',
      answers: [],
    },
    dispositionEncounter: {
      uuid: 'test-encounter-uuid-2',
      encounterDatetime: '2023-10-15T14:30:00.000+0000',
      patient: { uuid: 'test-patient-uuid-2' },
      location: { uuid: 'test-location-uuid-2' },
      form: {
        name: 'Admission Form',
        uuid: 'test-form-uuid',
        version: '1.0',
        published: true,
        retired: false,
        resources: [],
        encounterType: {
          uuid: 'test-encounter-type-uuid',
          name: 'Admission',
          viewPrivilege: null,
          editPrivilege: null,
        },
      },
      encounterType: { uuid: 'test-encounter-type-uuid', name: 'Admission', display: 'Admission' },
      obs: [],
      orders: [],
      voided: false,
      auditInfo: {
        creator: { uuid: 'test-creator-uuid', display: 'Admin' },
        dateCreated: '2023-10-15T14:30:00.000+0000',
        changedBy: null,
        dateChanged: null,
      },
      visit: {
        uuid: 'test-visit-uuid-2',
        startDatetime: '2023-10-15T14:00:00.000+0000',
        encounters: [],
      },
      encounterProviders: [],
      diagnoses: [],
      resourceVersion: '1.9',
    },
    dispositionObsGroup: {
      uuid: 'test-obs-group-uuid-2',
      concept: { uuid: 'test-concept-uuid' },
      value: null,
      obsDatetime: '2023-10-15T14:30:00.000+0000',
    },
    visit: {
      uuid: 'test-visit-uuid-2',
      startDatetime: '2023-10-15T14:00:00.000+0000',
      encounters: [],
    },
  },
];

describe('AdmissionRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render loading skeleton when data is loading', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: [],
      isLoading: true,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    const loadingSkeleton = screen.getByRole('table');
    expect(loadingSkeleton).toBeInTheDocument();
    expect(loadingSkeleton).toHaveClass('cds--skeleton cds--data-table');
  });

  test('should render error state when there is an error', () => {
    const errorMessage = 'Failed to fetch admission requests';
    const error = new Error(errorMessage);

    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: [],
      isLoading: false,
      error: error,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    expect(screen.getByText(/Admission Request/i)).toBeInTheDocument();
  });

  test('should render empty state when there are no admission requests', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: [],
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    // Check for the header title
    expect(screen.getByText(/Admission Request/i)).toBeInTheDocument();
    // Check for the empty state button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should launch admission request form when clicking add button in empty state', async () => {
    const user = userEvent.setup();

    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: [],
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    const addButton = screen.getByRole('button');
    await user.click(addButton);

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      workspaceTitle: 'Admission Request',
      mutateForm: mockMutate,
      formInfo: {
        formUuid: 'test-admission-form-uuid',
        encounterUuid: '',
      },
    });
  });

  test('should render admission requests table with data', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: mockAdmissionRequestData,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    // Check table headers
    expect(screen.getByText('Request Datetime')).toBeInTheDocument();
    expect(screen.getByText('Admission Location')).toBeInTheDocument();
    expect(screen.getByText('Admission Type')).toBeInTheDocument();
    expect(screen.getByText('Disposition')).toBeInTheDocument();

    // Check table data
    expect(screen.getByText('Ward A')).toBeInTheDocument();
    expect(screen.getByText('Ward B')).toBeInTheDocument();
    expect(screen.getByText('Admit to hospital')).toBeInTheDocument();
    expect(screen.getByText('Admit to ICU')).toBeInTheDocument();
    expect(screen.getAllByText('ADMIT')).toHaveLength(2);
  });

  it('should render Add button in header when data is available', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: mockAdmissionRequestData,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    const addButton = screen.getByRole('button', { name: /Add/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should launch admission request form when clicking Add button', async () => {
    const user = userEvent.setup();

    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: mockAdmissionRequestData,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    const addButton = screen.getByRole('button', { name: /Add/i });
    await user.click(addButton);

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      workspaceTitle: 'Admission Request',
      mutateForm: mockMutate,
      formInfo: {
        formUuid: 'test-admission-form-uuid',
        encounterUuid: '',
      },
    });
  });

  test('should format dates correctly in the table', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: mockAdmissionRequestData,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    expect(mockFormatDatetime).toHaveBeenCalled();
    expect(screen.getAllByText('2023-10-16 10:30 AM')).toHaveLength(2);
  });

  test('should render table with correct number of rows', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: mockAdmissionRequestData,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    const tableRows = screen.getAllByRole('row');
    // 1 header row + 2 data rows
    expect(tableRows).toHaveLength(3);
  });

  test('should handle missing disposition location gracefully', () => {
    const dataWithMissingLocation = [
      {
        ...mockAdmissionRequestData[0],
        dispositionLocation: undefined,
      },
    ];

    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: dataWithMissingLocation,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    // Should still render table
    expect(screen.getByText('Request Datetime')).toBeInTheDocument();
    expect(screen.getByText('Admission Location')).toBeInTheDocument();
  });

  test('should transform admission request data correctly', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: mockAdmissionRequestData,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    // Verify that all expected data is displayed
    const expectedLocations = ['Ward A', 'Ward B'];
    const expectedDispositions = ['Admit to hospital', 'Admit to ICU'];

    expectedLocations.forEach((location) => {
      expect(screen.getByText(location)).toBeInTheDocument();
    });

    expectedDispositions.forEach((disposition) => {
      expect(screen.getByText(disposition)).toBeInTheDocument();
    });
  });

  test('should call useAdmissionRequest with correct patient UUID', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: [],
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    expect(mockUseAdmissionRequest).toHaveBeenCalledWith(patientUuid);
  });

  test('should render table headers in correct order', () => {
    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: mockAdmissionRequestData,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Request Datetime');
    expect(headers[1]).toHaveTextContent('Admission Location');
    expect(headers[2]).toHaveTextContent('Admission Type');
    expect(headers[3]).toHaveTextContent('Disposition');
  });

  test('should use tablet size for non-desktop layouts', () => {
    mockIsDesktop.mockReturnValue(false);
    mockUseLayoutType.mockReturnValue('tablet' as any);

    mockUseAdmissionRequest.mockReturnValue({
      admissionRequest: mockAdmissionRequestData,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    render(<AdmissionRequest patientUuid={patientUuid} />);

    // Verify the table is still rendered correctly
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });
});
