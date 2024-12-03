import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useReactToPrint } from 'react-to-print';
import { useConfig } from '@openmrs/esm-framework';
import { usePatientSummary } from '../hooks/usePatientSummary';
import { mockPatient } from '../../../../__mocks__/patient-summary.mock';
import PatientSummary from './patient-summary.component';

jest.mock('../hooks/usePatientSummary');

const mockedUseConfig = useConfig as jest.Mock;
const mockedUsePatientSummary = usePatientSummary as jest.Mock;
const mockedUseReactToPrint = jest.mocked(useReactToPrint);

jest.mock('react-to-print', () => {
  const originalModule = jest.requireActual('react-to-print');

  return {
    ...originalModule,
    useReactToPrint: jest.fn(),
  };
});

describe('PatientSummary', () => {
  beforeEach(() => {
    mockedUsePatientSummary.mockReturnValue({
      data: null,
      error: false,
      isLoading: true,
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('renders a skeleton loader when loading', () => {
    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    const skeletonLoader = screen.getByRole('progressbar');
    expect(skeletonLoader).toBeInTheDocument();
  });

  it('renders an error message when data retrieval fails', () => {
    const mockError = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockedUsePatientSummary.mockReturnValue({
      data: null,
      error: mockError,
      isLoading: false,
    });

    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    const errorMessage = screen.getByText('Error loading patient summary');
    expect(errorMessage).toBeInTheDocument();
  });

  it('renders patient summary data when loaded', () => {
    mockedUsePatientSummary.mockReturnValue({
      data: mockPatient,
      error: null,
      isLoading: false,
    });

    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    expect(screen.getByText(mockPatient.patientName)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.birthDate)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.reportDate)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.age)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.maritalStatus)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.mflCode)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.clinicName)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.nationalUniquePatientIdentifier)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.weight)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.height)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.bmi)).toBeInTheDocument();
    expect(screen.getByText(`${mockPatient.bloodPressure}/${mockPatient.bpDiastolic}`)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.oxygenSaturation)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.pulseRate)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.familyProtection)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.respiratoryRate)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.tbScreeningOutcome)).toBeInTheDocument();
    // TODO: Extend the test to check all the values
  });

  it('triggers print when print button is clicked', async () => {
    const user = userEvent.setup();

    mockedUsePatientSummary.mockReturnValue({
      data: mockPatient,
      error: null,
      isLoading: false,
    });

    mockedUseConfig.mockReturnValue({ logo: {} });

    render(<PatientSummary patientUuid={mockPatient.uuid} />);

    const printButton = screen.getByRole('button', { name: /print/i });
    expect(printButton).toBeInTheDocument();

    await screen.findByText(/patient summary/i);
    await user.click(printButton);

    // FIXME: Why does this happen twice?
    expect(mockedUseReactToPrint).toHaveBeenCalled();
  });
});
