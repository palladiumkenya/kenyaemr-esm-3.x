import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramEnrollment, { ProgramEnrollmentProps } from './program-enrollment.component';
import { showNotification } from '@openmrs/esm-framework';

const mockLaunchWorkspace = jest.fn();
const mockShowNotification = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  showNotification: jest.fn(),
}));

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
    launchPatientWorkspace: mockLaunchWorkspace,
  };

  it('displays active program enrollment details correctly', () => {
    render(<ProgramEnrollment {...mockProps} />);

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

    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    expect(screen.getByText(/2023-08-06/i)).toBeInTheDocument();
    expect(screen.getByText(/WHO Stage/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Entry Point/i)).toBeInTheDocument();
    expect(screen.getByText(/IPD/i)).toBeInTheDocument();
  });

  test('should show notification error when there is no encounter when launching forms', () => {
    render(<ProgramEnrollment {...mockProps} />);

    const editButton = screen.getByText(/Edit/i);
    const deleteButton = screen.getByText(/Discontinue/i);

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(showNotification).toHaveBeenCalledWith({
      title: 'Edit enrollment',
      kind: 'error',
      description:
        'The enrollment form does not have an encounter associated with it, Please contact your system administrator to add an encounter to the enrollment',
    });
  });

  test("should launch patient workspace when clicking on 'Edit' button", () => {
    const updatedMockProps = {
      ...mockProps,
      data: [
        {
          ...mockProps.data[0],
          data: [
            {
              ...mockProps.data[0].data[0],
              enrollmentFormUuid: 'encounter-123',
              enrollmentFormName: 'some form name',
              enrollmentEncounterUuid: 'some-encounter-uuid',
              discontinuationFormUuid: 'discontinuation-123',
              discontinuationFormName: 'some form name',
            },
          ],
        },
      ],
    };
    render(<ProgramEnrollment {...updatedMockProps} />);

    // Trigger the edit button
    const editButton = screen.getByText(/Edit/i);

    fireEvent.click(editButton);
    expect(mockLaunchWorkspace).toHaveBeenCalled();
    expect(mockLaunchWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      formInfo: { encounterUuid: 'some-encounter-uuid', formUuid: 'encounter-123' },
      workspaceTitle: 'some form name',
    });
  });
});
