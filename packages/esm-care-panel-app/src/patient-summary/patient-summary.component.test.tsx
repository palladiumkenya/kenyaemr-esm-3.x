import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import PatientSummary from './patient-summary.component';
import { useConfig } from '@openmrs/esm-framework';
import { usePatientSummary } from '../hooks/usePatientSummary';
import { mockPatient } from '../../../../__mocks__/patient-summary.mock';
import dayjs from 'dayjs';

jest.mock('../hooks/usePatientSummary');

const mockedUseConfig = useConfig as jest.Mock;
const mockedUsePatientSummary = usePatientSummary as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  return {
    ...jest.requireActual('@openmrs/esm-framework'),
    formatDate: jest.fn().mockImplementation((mockDate) => `${dayjs(mockDate).format('DD-MMM-YYYY')}`),
  };
});

describe('PatientSummary', () => {
  beforeEach(() => {
    mockedUsePatientSummary.mockReturnValue({
      data: null,
      isError: false,
      isLoading: true,
    });
  });

  afterEach(() => mockedUsePatientSummary.mockReset());

  it('renders a skeleton loader when loading', () => {
    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    const skeletonLoader = screen.getByRole('progressbar');
    expect(skeletonLoader).toBeInTheDocument();
  });

  it('renders an error message when data retrieval fails', () => {
    mockedUsePatientSummary.mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });

    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    const errorMessage = screen.getByText('Error loading patient summary');
    expect(errorMessage).toBeInTheDocument();
  });

  it('renders patient summary data when loaded', () => {
    mockedUsePatientSummary.mockReturnValue({
      data: mockPatient,
      isError: false,
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
    expect(screen.getByText(mockPatient.bloodPressure)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.oxygenSaturation)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.pulseRate)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.familyProtection)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.respiratoryRate)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.tbScreeningOutcome)).toBeInTheDocument();
    // TODO: Extend the test to check all the values
  });

  it('triggers print when print button is clicked', async () => {
    mockedUsePatientSummary.mockReturnValue({
      data: mockPatient,
      isError: false,
      isLoading: false,
    });

    const printFunction = jest.fn();
    const useReactToPrintSpy = jest.spyOn(require('react-to-print'), 'useReactToPrint');

    useReactToPrintSpy.mockReturnValue(printFunction);
    mockedUseConfig.mockReturnValue({ logo: {} });

    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    const printButton = screen.getByText('Print', { exact: true });

    act(() => {
      fireEvent.click(printButton);
    });

    await waitFor(() => {
      expect(printFunction).toHaveBeenCalledTimes(1);
    });
  });
});
