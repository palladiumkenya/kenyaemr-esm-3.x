import React from 'react';
import { screen, render } from '@testing-library/react';
import PatientFlags from './patient-flags.component';
import * as mockUsePatientFlags from '../hooks/usePatientFlags';

describe('<PatientFlags/>', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should display loading spinner, while loading flags', () => {
    spyOn(mockUsePatientFlags, 'usePatientFlags').and.returnValue({
      isLoading: true,
      patientFlags: [],
      error: null,
    });

    render(<PatientFlags patientUuid="some-patient-uuid" />);
    expect(screen.getByText(/^loading$/i)).toBeInTheDocument();
  });

  test('should display patient flags', () => {
    spyOn(mockUsePatientFlags, 'usePatientFlags').and.returnValue({
      isLoading: false,
      patientFlags: ['hiv', 'cancer'],
      error: null,
    });

    render(<PatientFlags patientUuid="some-patient-uuid" />);
    expect(screen.getByText(/^hiv$/i)).toBeInTheDocument();
    expect(screen.getByText(/^cancer$/i)).toBeInTheDocument();
  });
});
