import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from '../bill-deposit-search.scss';

interface PatientSearchProps {
  onPatientSelect: (uuid: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onPatientSelect }) => {
  return (
    <ExtensionSlot
      className={styles.searchBar}
      name="patient-search-bar-slot"
      state={{
        selectPatientAction: onPatientSelect,
        buttonProps: {
          kind: 'secondary',
        },
      }}
    />
  );
};

export default PatientSearch;
