import { Layer } from '@carbon/react';
import React from 'react';
import { usePatientVitals } from './dispensing-patient-vitals.resources';

type PatientVitalsProps = {
  patientUuid: string;
  encounterUuid: string;
};
const DispensingPatientVitals: React.FC<PatientVitalsProps> = ({ encounterUuid, patientUuid }) => {
  const { vitals, error, isLoading } = usePatientVitals(patientUuid, encounterUuid);

  if (isLoading || error) {
    return null;
  }
  return (
    <Layer>
      {vitals.map((vital) => (
        <div>
          <strong>{vital?.display}: </strong>
          <span>{vital?.value}</span>
        </div>
      ))}
    </Layer>
  );
};

export default DispensingPatientVitals;
