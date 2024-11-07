import React from 'react';
import { screen, render } from '@testing-library/react';
import DefaulterTracing from './defaulter-tracing.component';
import { usePatientTracing } from '../../../hooks/usePatientTracing';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import useEvent from '@testing-library/user-event';
import * as mock from '@openmrs/esm-framework/mock';

const usePatientTracingMock = usePatientTracing as jest.MockedFunction<typeof usePatientTracing>;
const launchPatientWorkspaceMock = launchPatientWorkspace as jest.MockedFunction<typeof launchPatientWorkspace>;

jest.mock('../../../hooks/usePatientTracing', () => ({
  defaulterTracingEncounterUuid: 'some-uuid',
  usePatientTracing: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchPatientWorkspace: jest.fn(),
}));

jest.spyOn(mock, 'useConfig').mockReturnValue({
  formsList: {
    defaulterTracingFormUuid: 'defaulterTracingFormUuid',
  },
});

describe('DefaulterTracing', () => {
  test('should launch `Defaulter Tracing` form', async () => {
    const user = useEvent.setup();
    usePatientTracingMock.mockReturnValue({
      encounters: [],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
    });
    render(<DefaulterTracing patientUuid="patientUuid" />);
    const recordDefaulterTracing = screen.getByRole('button', { name: /Record Defaulter Tracing/i });
    await user.click(recordDefaulterTracing);
    expect(launchPatientWorkspaceMock).toBeCalledWith('patient-form-entry-workspace', {
      formInfo: {
        encounterUuid: '',
        formUuid: 'defaulterTracingFormUuid',
        patientUuid: 'patientUuid',
        visitTypeUuid: '',
        visitUuid: '',
      },
      mutateForm: expect.any(Function),
      workspaceTitle: 'Defaulter Tracing',
    });
  });
});
