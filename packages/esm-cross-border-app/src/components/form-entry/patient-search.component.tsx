import React from 'react';
import styles from './patient-search.scss';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';

const PatientSearch: React.FC = (formUuid: string, encounterUuid: string) => {
  const selectPatient = (patientUuid: string) => {
    launchPatientChartWithWorkspaceOpen({
      patientUuid,
      workspaceName: 'clinical-forms-workspace',
      additionalProps: {
        formInfo: { formUuid, encounterUuid },
        mutateForm: () => {},
      },
    });
  };

  return (
    <div className={styles.patientSearchContainer}>
      <ExtensionSlot
        name="patient-search-bar-slot"
        state={{
          selectPatientAction: selectPatient,
          buttonProps: {
            kind: 'secondary',
          },
        }}
      />
    </div>
  );
};

export default PatientSearch;
