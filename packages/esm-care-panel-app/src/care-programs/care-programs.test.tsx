import React from 'react';
import { screen, render } from '@testing-library/react';
import CarePrograms from './care-programs.component';
import * as careProgramsHook from '../hooks/useCarePrograms';
import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { useVisit, launchWorkspace } from '@openmrs/esm-framework';
import { PatientCarePrograms } from '../hooks/useCarePrograms';
import userEvent from '@testing-library/user-event';

jest.mock('../hooks/useCarePrograms');

const mockUseVisit = useVisit as jest.Mock;

const testProps = {
  isLoading: true,
  isValidating: false,
  error: null,
  carePrograms: [],
  mutate: jest.fn(),
};

const mockAPIResponse: Array<PatientCarePrograms> = [
  {
    uuid: 'dfdc6d40-2f2f-463d-ba90-cc97350441a8',
    display: 'HIV',
    enrollmentFormUuid: 'e4b506c1-7379-42b6-a374-284469cba8da',
    discontinuationFormUuid: 'e3237ede-fa70-451f-9e6c-0908bc39f8b9',
    enrollmentStatus: 'active',
    enrollmentDetails: {
      uuid: '561f0766-6496-4f59-abc2-a4030788b3cc',
      dateEnrolled: '2023-10-25 03:27:15.0',
      dateCompleted: '',
      location: 'Moi Teaching Refferal Hospital',
    },
  },
  {
    uuid: '9f144a34-3a4a-44a9-8486-6b7af6cc64f6',
    display: 'TB',
    enrollmentFormUuid: '89994550-9939-40f3-afa6-173bce445c79',
    discontinuationFormUuid: '4b296dd0-f6be-4007-9eb8-d0fd4e94fb3a',
    enrollmentStatus: 'eligible',
  },
];

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchStartVisitPrompt: jest.fn(),
  launchPatientWorkspace: jest.fn(),
}));

describe('CarePrograms', () => {
  xtest('should render loading spinner while fetching care programs', () => {
    jest.spyOn(careProgramsHook, 'useCarePrograms').mockReturnValueOnce({ ...testProps });
    renderCarePrograms();
    const loadingSpinner = screen.getByText('Loading data...');
    expect(loadingSpinner).toBeInTheDocument();
  });

  xtest('should render error state message in API has error', () => {
    jest
      .spyOn(careProgramsHook, 'useCarePrograms')
      .mockReturnValueOnce({ ...testProps, isLoading: false, error: new Error('Internal error 500') });
    renderCarePrograms();
    const errorMessage = screen.getByText(
      'Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above.',
    );
    expect(errorMessage).toBeInTheDocument();
  });

  xtest('should display empty state if the patient is not eligible to any program', () => {
    jest
      .spyOn(careProgramsHook, 'useCarePrograms')
      .mockReturnValueOnce({ ...testProps, isLoading: false, carePrograms: [] });

    renderCarePrograms();
    const emptyStateMessage = screen.getByText('There are no {{displayText}} to display for this patient');
    const displayTitle = screen.getByRole('heading', { name: 'Care program' });
    expect(emptyStateMessage).toBeInTheDocument();
    expect(displayTitle).toBeInTheDocument();
  });

  test('should display patient eligible programs and launch enrollment or discontinuation form', async () => {
    const user = userEvent.setup();
    jest
      .spyOn(careProgramsHook, 'useCarePrograms')
      .mockReturnValueOnce({ ...testProps, isLoading: false, carePrograms: mockAPIResponse });
    mockUseVisit.mockReturnValue({ currentVisit: { uuid: 'some-visitUuid' } });
    renderCarePrograms();

    const tableHeaders = ['Program name', 'Status'];
    tableHeaders.forEach((tableHeader) => expect(screen.getByText(tableHeader)).toBeInTheDocument());
    const cardTitle = screen.getByRole('heading', { name: 'Care Programs' });
    expect(cardTitle).toBeInTheDocument();

    const enrollButton = screen.getByRole('button', { name: /Enroll/ });
    const discontinueButton = screen.getByRole('button', { name: /Discontinue/ });
    await user.click(enrollButton);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      formInfo: {
        additionalProps: { enrollmenrDetails: expect.anything() },
        encounterUuid: '',
        formUuid: '89994550-9939-40f3-afa6-173bce445c79',
      },
      mutateForm: expect.anything(),
      workspaceTitle: 'TB Enrollment form',
    });

    await user.click(discontinueButton);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', {
      formInfo: {
        additionalProps: {
          enrollmenrDetails: {
            dateCompleted: '',
            dateEnrolled: '2023-10-25 03:27:15.0',
            location: 'Moi Teaching Refferal Hospital',
            uuid: '561f0766-6496-4f59-abc2-a4030788b3cc',
          },
        },
        encounterUuid: '',
        formUuid: 'e3237ede-fa70-451f-9e6c-0908bc39f8b9',
      },
      mutateForm: expect.anything(),
      workspaceTitle: 'HIV Discontinuation form',
    });
  });

  xtest('should prompt user to start Visit before filling any enrollment form', async () => {
    const user = userEvent.setup();
    mockUseVisit.mockReturnValue({ currentVisit: null });
    jest
      .spyOn(careProgramsHook, 'useCarePrograms')
      .mockReturnValueOnce({ ...testProps, isLoading: false, carePrograms: mockAPIResponse });
    renderCarePrograms();

    const enrollButton = screen.getByRole('button', { name: /Enroll/ });
    await user.click(enrollButton);
    expect(launchStartVisitPrompt).toHaveBeenCalled();
  });
});

const renderCarePrograms = () => {
  render(<CarePrograms patientUuid="some-patient-uuid" />);
};
