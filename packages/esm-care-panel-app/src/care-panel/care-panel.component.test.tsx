import React from 'react';
import { render, screen } from '@testing-library/react';
import CarePanel from './care-panel.component';
import { mockComponent } from 'react-dom/test-utils';
import { mockPatient } from '../../../../__mocks__/patient-summary.mock';

jest.mock('../program-summary/program-summary.component', () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-program-summary" />,
}));
jest.mock('../program-enrollment/program-enrollment.component', () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-program-enrollment" />,
}));

const mockPatientUuid = mockPatient.uuid;

jest.mock('@carbon/react', () => ({
  StructuredListSkeleton: () => <div data-testid="mocked-structured-list-skeleton" />,
  ContentSwitcher: ({ children }) => <div data-testid="mocked-content-switcher">{children}</div>,
  Switch: ({ text }) => <button>{text}</button>,
  InlineLoading: () => <div data-testid="mocked-inline-loading" />,
}));

describe('CarePanel Component', () => {
  xit('renders without crashing', () => {
    jest.spyOn(require('../hooks/useEnrollmentHistory'), 'useEnrollmentHistory').mockReturnValue({
      data: [{ patientUuid: mockPatientUuid }],
      isLoading: false,
      isError: false,
    });
    render(<CarePanel patientUuid={mockPatientUuid} formEntrySub={jest.fn()} launchPatientWorkspace={jest.fn()} />);
    expect(screen.getByText('Care Panel')).toBeInTheDocument();
  });

  xit('displays loading skeleton when isLoading is true', () => {
    jest.spyOn(require('../hooks/useEnrollmentHistory'), 'useEnrollmentHistory').mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });

    render(<CarePanel patientUuid={mockPatientUuid} formEntrySub={jest.fn()} launchPatientWorkspace={jest.fn()} />);

    expect(screen.getByTestId('mocked-structured-list-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-program-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mocked-program-enrollment')).not.toBeInTheDocument();
  });

  xit('displays error message when isError is true', () => {
    jest.spyOn(require('../hooks/useEnrollmentHistory'), 'useEnrollmentHistory').mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(<CarePanel patientUuid={mockPatientUuid} formEntrySub={jest.fn()} launchPatientWorkspace={jest.fn()} />);

    expect(screen.getByText('Error loading program enrollments')).toBeInTheDocument();
    expect(screen.queryByTestId('mocked-structured-list-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mocked-program-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mocked-program-enrollment')).not.toBeInTheDocument();
  });
});
