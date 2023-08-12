import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import PatientSummary from './patient-summary.component';
import { useConfig } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient-summary.mock';

const mockUseConfig = useConfig as jest.Mock;

describe('PatientSummary', () => {
  it('renders skeleton loader when loading', () => {
    jest.spyOn(require('../hooks/usePatientSummary'), 'usePatientSummary').mockReturnValue({
      data: null,
      isError: false,
      isLoading: true,
    });

    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    const skeletonLoader = screen.getByRole('progressbar');
    expect(skeletonLoader).toBeInTheDocument();
  });

  it('renders error message when data retrieval fails', () => {
    jest.spyOn(require('../hooks/usePatientSummary'), 'usePatientSummary').mockReturnValue({
      data: null,
      isError: true,
      isLoading: false,
    });

    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    const errorMessage = screen.getByText('Error loading patient summary');
    expect(errorMessage).toBeInTheDocument();
  });

  it('renders patient summary data when loaded', () => {
    jest.spyOn(require('../hooks/usePatientSummary'), 'usePatientSummary').mockReturnValue({
      data: mockPatient,
      isError: false,
      isLoading: false,
    });

    render(<PatientSummary patientUuid={mockPatient.uuid} />);
    expect(screen.getByText(mockPatient.patientName)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.birthDate)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.age)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.maritalStatus)).toBeInTheDocument();
    expect(screen.getByText(mockPatient.mflCode)).toBeInTheDocument();
  });

  it('triggers print when print button is clicked', async () => {
    jest.spyOn(require('../hooks/usePatientSummary'), 'usePatientSummary').mockReturnValue({
      data: mockPatient,
      isError: false,
      isLoading: false,
    });
    const printFunction = jest.fn();
    const useReactToPrintSpy = jest.spyOn(require('react-to-print'), 'useReactToPrint');

    useReactToPrintSpy.mockReturnValue(printFunction);
    mockUseConfig.mockReturnValue({ logo: {} });

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
