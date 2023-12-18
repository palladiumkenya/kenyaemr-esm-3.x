import React from 'react';
import { screen, render } from '@testing-library/react';
import PatientFlags from './patient-flags.component';
import { usePatientFlags } from '../hooks/usePatientFlags';

const mockUsePatientFlags = usePatientFlags as jest.Mock;

jest.mock('../hooks/usePatientFlags', () => {
  const originalModule = jest.requireActual('../hooks/usePatientFlags');
  return { ...originalModule, usePatientFlags: jest.fn() };
});

describe('<PatientFlags/>', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should display patient flags', () => {
    mockUsePatientFlags.mockReturnValue({ isLoading: false, patientFlags: ['hiv', 'cancer'], error: null });
    render(<PatientFlags patientUuid="some-patient-uuid" />);
    expect(screen.getByText(/^hiv$/i)).toBeInTheDocument();
    expect(screen.getByText(/^cancer$/i)).toBeInTheDocument();
  });

  test("should display error message when there's an error", () => {
    mockUsePatientFlags.mockReturnValue({ isLoading: false, patientFlags: [], error: 'some-error' });
    render(<PatientFlags patientUuid="some-patient-uuid" />);
    expect(screen.getByText(/Error loading patient flags/i)).toBeInTheDocument();
  });
});
