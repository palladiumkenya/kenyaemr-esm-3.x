import { ExtensionSlot } from '@openmrs/esm-framework';
import React, { Dispatch, SetStateAction } from 'react';
import styles from './patient-bills-dashboard.scss';

type PatientSearchExtensionProps = {
  setPatientUuid: Dispatch<SetStateAction<string | undefined>>;
};

const PatientSearchExtension: React.FC<PatientSearchExtensionProps> = ({ setPatientUuid }) => {
  return (
    <div className={styles.patientSearchExtensionContainer}>
      <ExtensionSlot
        name="patient-search-bar-slot"
        state={{
          selectPatientAction: (patientUuid: string) => setPatientUuid(patientUuid),
          buttonProps: {
            kind: 'secondary',
          },
        }}
      />
    </div>
  );
};

export default PatientSearchExtension;
