import { Tile } from '@carbon/react';
import React from 'react';
import { usePatientVitals } from './dispensing-patient-vitals.resources';
import styles from './patient-info.scss';

type PatientVitalsProps = {
  patientUuid: string;
  encounterUuid: string;
};
const DispensingPatientVitals: React.FC<PatientVitalsProps> = ({ patientUuid }) => {
  const { vitals, error, isLoading } = usePatientVitals(patientUuid);

  if (isLoading || error || !vitals.length) {
    return null;
  }
  return (
    <Tile className={styles.container}>
      {vitals.map((vital) => (
        <div>
          <strong>{vital?.display}: </strong>
          <span>{vital?.value}</span>
        </div>
      ))}
    </Tile>
  );
};

export default DispensingPatientVitals;
