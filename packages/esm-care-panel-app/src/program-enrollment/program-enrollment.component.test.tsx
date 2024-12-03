import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramEnrollment from './program-enrollment.component';
import { useHeiOutcome } from '../hooks/useHeiOutcome';
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({ t: (key: string) => key })),
}));

jest.mock('../hooks/useHeiOutcome', () => ({
  useHeiOutcome: jest.fn(),
}));

const mockFormEntrySub = jest.fn();

describe('ProgramEnrollment Component', () => {
  beforeEach(() => {
    (useHeiOutcome as jest.Mock).mockReturnValue({ heiOutcome: { heiNumber: null } });
  });

  it('renders without crashing', () => {
    render(
      <ProgramEnrollment
        enrollments={[]}
        programName="HIV"
        patientUuid="test-patient-uuid"
        formEntrySub={mockFormEntrySub}
      />,
    );
    expect(screen.queryByText('EnrollmentDetails')).not.toBeInTheDocument();
  });

  it('renders enrollment history when data is present', () => {
    const enrollments = [
      {
        enrollmentUuid: '1',
        dateEnrolled: '01-Jan-2024',
        programName: 'HIV',
        firstEncounter: { changeReasons: ['Reason1', 'Reason2'] },
      },
    ];
    render(
      <ProgramEnrollment
        enrollments={enrollments}
        programName="HIV"
        patientUuid="test-patient-uuid"
        formEntrySub={mockFormEntrySub}
      />,
    );
    expect(screen.getByText('Enrolled on')).toBeInTheDocument();
    expect(screen.getByText('01-Jan-2024')).toBeInTheDocument();
  });

  it('shows "Edit" and "Discontinue" menu options when an enrollment is active', async () => {
    const enrollments = [{ enrollmentUuid: '1', dateEnrolled: '2024-01-01', dateCompleted: null, programName: 'HIV' }];

    render(
      <ProgramEnrollment
        enrollments={enrollments}
        programName="HIV"
        patientUuid="test-patient-uuid"
        formEntrySub={mockFormEntrySub}
      />,
    );

    const overflowMenuTrigger = screen.getByRole('button', { hidden: true });
    fireEvent.click(overflowMenuTrigger);
    const editOption = await screen.findByText(/edit/i);
    expect(editOption).toBeInTheDocument();

    const discontinueOption = await screen.findByText(/Discontinue/i);
    expect(discontinueOption).toBeInTheDocument();
  });

  it('hides menu options if enrollment is completed', () => {
    const enrollments = [{ enrollmentUuid: '1', dateEnrolled: '2024-01-01', dateCompleted: '2024-02-01' }];
    render(
      <ProgramEnrollment
        enrollments={enrollments}
        programName="HIV"
        patientUuid="test-patient-uuid"
        formEntrySub={mockFormEntrySub}
      />,
    );
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('calls the handleEditEnrollment when "Edit" is clicked', async () => {
    const enrollments = [{ enrollmentUuid: '1', dateEnrolled: '2024-01-01', programName: 'HIV' }];
    render(
      <ProgramEnrollment
        enrollments={enrollments}
        programName="HIV"
        patientUuid="test-patient-uuid"
        formEntrySub={mockFormEntrySub}
      />,
    );

    const overflowMenuTrigger = screen.getByRole('button', { hidden: true });
    fireEvent.click(overflowMenuTrigger);
    const editOption = await screen.findByText(/edit/i);

    expect(editOption).toBeInTheDocument();
    fireEvent.click(editOption);
  });

  it('displays fallback if no enrollments', () => {
    render(
      <ProgramEnrollment
        enrollments={[]}
        programName="HIV"
        patientUuid="test-patient-uuid"
        formEntrySub={mockFormEntrySub}
      />,
    );
    expect(screen.queryByText('EnrollmentDetails')).not.toBeInTheDocument();
  });
});
