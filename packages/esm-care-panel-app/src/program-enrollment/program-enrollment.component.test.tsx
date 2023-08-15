import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgramEnrollment, { ProgramEnrollmentProps } from './program-enrollment.component';

describe('ProgramEnrollment Component', () => {
  const mockProps: ProgramEnrollmentProps = {
    patientUuid: 'patient-123',
    programName: 'HIV Program',
    data: [
      {
        status: 'Active',
        programName: 'HIV Program',
        data: [
          {
            dateEnrolled: '2023-08-06',
            programName: 'HIV',
            whoStage: 'Stage 2',
            entryPoint: 'OPD',
          },
        ],
      },
    ],
    formEntrySub: jest.fn(),
    launchPatientWorkspace: jest.fn(),
  };

  it('displays active program enrollment details correctly', () => {
    render(<ProgramEnrollment {...mockProps} />);

    expect(screen.getByText(/Current enrollment details/i)).toBeInTheDocument();
    expect(screen.getByText(/HIV program/i)).toBeInTheDocument();
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
    expect(screen.getByText(/Discontinue/i)).toBeInTheDocument();
    expect(screen.getByText(/enrolled/i)).toBeInTheDocument();
    expect(screen.getByText(/2023-08-06/i)).toBeInTheDocument();
    expect(screen.getByText(/WHO Stage/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Entry Point/i)).toBeInTheDocument();
    expect(screen.getByText(/OPD/i)).toBeInTheDocument();
  });

  it('displays inactive program enrollment details correctly', () => {
    render(
      <ProgramEnrollment
        {...mockProps}
        data={[
          {
            status: 'Inactive',
            programName: 'HIV Program',
            data: [
              {
                dateCompleted: '2023-08-06',
                programName: 'HIV',
                whoStage: 'Stage 2',
                entryPoint: 'IPD',
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText(/Historic enrollment/i)).toBeInTheDocument();
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    expect(screen.getByText(/2023-08-06/i)).toBeInTheDocument();
    expect(screen.getByText(/WHO Stage/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Entry Point/i)).toBeInTheDocument();
    expect(screen.getByText(/IPD/i)).toBeInTheDocument();
  });
});
