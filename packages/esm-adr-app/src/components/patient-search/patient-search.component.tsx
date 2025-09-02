import React from 'react';
import styles from './patient-search.scss';
import { ExtensionSlot, navigate } from '@openmrs/esm-framework';
import { launchPatientChartWithWorkspaceOpen } from '@openmrs/esm-patient-common-lib';
import { Layer } from '@carbon/react';

const PatientSearch: React.FC = () => {
  const selectPatient = (patientUuid: string) => {
    navigate({ to: `${window.spaBase}/adr-assessment/overview/${patientUuid}` });
  };

  return (
    <div className={styles.patientSearchContainer}>
      <Layer>
        <ExtensionSlot
          className={styles.patientSearchBar}
          name="patient-search-bar-slot"
          state={{
            selectPatientAction: selectPatient,
            buttonProps: {
              kind: 'secondary',
            },
          }}
        />
      </Layer>
    </div>
  );
};

export default PatientSearch;
